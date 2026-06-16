from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.schemas.admin import AdminCreateRequest, AdminUpdateRequest, AdminResponse, AdminLoginRequest, AdminRole
from app.utils.errors import DatabaseError, AuthenticationError


class AdminService:
    COLLECTION_NAME = "admins"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def _normalize(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return None
        document["_id"] = str(document["_id"])
        return document

    async def create_admin(self, payload: AdminCreateRequest) -> AdminResponse:
        existing = await self.db[self.COLLECTION_NAME].find_one({"email": payload.email})
        if existing:
            raise DatabaseError("Admin email already exists.")

        now = datetime.utcnow()
        hashed_password = get_password_hash(payload.password)
        document = {
            "email": payload.email,
            "password_hash": hashed_password,
            "phone_number": payload.phone_number,
            "role": payload.role.value,
            "is_active": payload.is_active,
            "created_at": now,
            "updated_at": now,
        }

        result = await self.db[self.COLLECTION_NAME].insert_one(document)
        document["_id"] = str(result.inserted_id)
        return AdminResponse(**document)

    async def get_admin(self, admin_id: str) -> AdminResponse:
        try:
            object_id = ObjectId(admin_id)
        except InvalidId:
            raise DatabaseError("Invalid admin ID format.")

        document = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not document:
            raise DatabaseError("Admin not found.")
        document = await self._normalize(document)
        return AdminResponse(**document)

    async def get_admin_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return await self.db[self.COLLECTION_NAME].find_one({"email": email})

    async def ensure_indexes(self) -> None:
        await self.db[self.COLLECTION_NAME].create_index("email", unique=True)

    async def ensure_super_admin(self, email: str, password: str, phone_number: str) -> AdminResponse:
        existing = await self.get_admin_by_email(email)
        if existing:
            if existing.get("role") != AdminRole.super_admin.value:
                raise DatabaseError("Existing admin email is not a super admin.")
            return AdminResponse(**await self._normalize(existing))

        now = datetime.utcnow()
        hashed_password = get_password_hash(password)
        document = {
            "email": email,
            "password_hash": hashed_password,
            "phone_number": phone_number,
            "role": AdminRole.super_admin.value,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }

        result = await self.db[self.COLLECTION_NAME].insert_one(document)
        document["_id"] = str(result.inserted_id)
        return AdminResponse(**document)

    async def list_admins(self, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        page = max(page, 1)
        limit = max(limit, 1)
        skip = (page - 1) * limit

        total_records = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_records + limit - 1) // limit, 1)

        cursor = self.db[self.COLLECTION_NAME].find().skip(skip).limit(limit)
        admins = []
        async for admin in cursor:
            admins.append(AdminResponse(**await self._normalize(admin)))

        return {
            "admins": admins,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_records": total_records,
                "has_next_page": page < total_pages,
                "has_previous_page": page > 1,
            },
        }

    async def update_admin(self, admin_id: str, payload: AdminUpdateRequest) -> AdminResponse:
        try:
            object_id = ObjectId(admin_id)
        except InvalidId:
            raise DatabaseError("Invalid admin ID format.")

        document = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not document:
            raise DatabaseError("Admin not found.")

        update_data: Dict[str, Any] = {}
        if payload.email is not None:
            update_data["email"] = payload.email
        if payload.password is not None:
            update_data["password_hash"] = get_password_hash(payload.password)
        if payload.phone_number is not None:
            update_data["phone_number"] = payload.phone_number
        if payload.role is not None:
            update_data["role"] = payload.role.value
        if payload.is_active is not None:
            update_data["is_active"] = payload.is_active

        if not update_data:
            raise DatabaseError("No fields provided for update.")

        update_data["updated_at"] = datetime.utcnow()
        await self.db[self.COLLECTION_NAME].update_one({"_id": object_id}, {"$set": update_data})

        document = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        document = await self._normalize(document)
        return AdminResponse(**document)

    async def delete_admin(self, admin_id: str) -> None:
        try:
            object_id = ObjectId(admin_id)
        except InvalidId:
            raise DatabaseError("Invalid admin ID format.")

        result = await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
        if result.deleted_count == 0:
            raise DatabaseError("Admin not found.")

    async def authenticate_admin(self, payload: AdminLoginRequest) -> Dict[str, str]:
        admin = await self.db[self.COLLECTION_NAME].find_one({"email": payload.email})
        if not admin or not verify_password(payload.password, admin["password_hash"]):
            raise AuthenticationError("Invalid email or password.")

        if not admin.get("is_active", True):
            raise AuthenticationError("Admin is deactivated.")

        access_token = create_access_token(str(admin["_id"]), admin["email"], admin["role"])
        refresh_token = create_refresh_token(str(admin["_id"]), admin["email"], admin["role"])
        return {"access_token": access_token, "refresh_token": refresh_token}
