from typing import Any, Dict

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.user import UserUpdateRequest, UserResponse, PaginatedUsers

class UserService:
    COLLECTION_NAME = "users"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize_user_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return document
        return document

    async def list_users(self, page: int = 1, page_size: int = 50) -> PaginatedUsers:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_users = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_users + page_size - 1) // page_size, 1)

        cursor = self.db[self.COLLECTION_NAME].find().skip(skip).limit(page_size)
        users = []
        async for user in cursor:
            user["_id"] = str(user["_id"])
            users.append(UserResponse(**self._normalize_user_document(user)))

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_users": total_users,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        }
        return PaginatedUsers(users=users, pagination=pagination)

    async def get_user(self, user_id: str) -> UserResponse:
        try:
            object_id = ObjectId(user_id)
        except InvalidId:
            raise ValueError("Invalid user ID format.")

        user = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not user:
            raise LookupError("User not found.")

        user["_id"] = str(user["_id"])
        return UserResponse(**self._normalize_user_document(user))

    async def update_user(
        self,
        user_id: str,
        payload: UserUpdateRequest
    ) -> UserResponse:
        try:
            object_id = ObjectId(user_id)
        except InvalidId:
            raise ValueError("Invalid user ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("User not found.")

        update_data = {}
        if payload.name is not None:
            update_data["name"] = payload.name
        if payload.phone is not None:
            update_data["phone"] = payload.phone
        if payload.is_blocked is not None:
            update_data["is_blocked"] = payload.is_blocked

        if not update_data:
            raise ValueError("No update fields were provided.")

        await self.db[self.COLLECTION_NAME].update_one({"_id": object_id}, {"$set": update_data})
        updated = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        updated["_id"] = str(updated["_id"])
        return UserResponse(**self._normalize_user_document(updated))

    async def delete_user(self, user_id: str) -> None:
        try:
            object_id = ObjectId(user_id)
        except InvalidId:
            raise ValueError("Invalid user ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("User not found.")

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
