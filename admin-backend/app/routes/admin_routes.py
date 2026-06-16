from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.admin import (
    AdminCreateRequest,
    AdminUpdateRequest,
    AdminResponse,
    AdminLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    AdminListResponse,
)
from app.services.admin_service import AdminService
from app.utils.errors import ValidationError
from app.utils.logging import log_info

router = APIRouter(prefix="/admins", tags=["Admins"])


def _respond(message: str, data=None):
    return JSONResponse({"status": "success", "message": message, "data": data})


@router.post("/", response_model=AdminResponse)
async def create_admin(
    payload: AdminCreateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(require_roles("super_admin")),
):
    service = AdminService(db)
    admin = await service.create_admin(payload)
    log_info("Admin created", creator=current_admin.email, admin=admin.email)
    return admin


@router.get("/", response_model=AdminListResponse)
async def list_admins(
    page: int = 1,
    limit: int = 10,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(require_roles("super_admin")),
):
    service = AdminService(db)
    result = await service.list_admins(page=page, limit=limit)
    return result


@router.get("/{admin_id}", response_model=AdminResponse)
async def get_admin(
    admin_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(require_roles("super_admin")),
):
    service = AdminService(db)
    return await service.get_admin(admin_id)


@router.put("/{admin_id}", response_model=AdminResponse)
async def update_admin(
    admin_id: str,
    payload: AdminUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(require_roles("super_admin")),
):
    service = AdminService(db)
    admin = await service.update_admin(admin_id, payload)
    log_info("Admin updated", actor=current_admin.email, admin=admin.email)
    return admin


@router.delete("/{admin_id}")
async def delete_admin(
    admin_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(require_roles("super_admin")),
):
    service = AdminService(db)
    await service.delete_admin(admin_id)
    log_info("Admin deleted", actor=current_admin.email, admin_id=admin_id)
    return _respond("Admin deleted successfully.")


@router.post("/login", response_model=TokenResponse, tags=["Authentication"])
async def login(payload: AdminLoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = AdminService(db)
    tokens = await service.authenticate_admin(payload)
    log_info("Admin login", email=payload.email)
    return {"access_token": tokens["access_token"], "refresh_token": tokens["refresh_token"]}


@router.post("/refresh", response_model=TokenResponse, tags=["Authentication"])
async def refresh_token(payload: RefreshTokenRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    from app.core.security import decode_token, create_access_token

    token_data = decode_token(payload.refresh_token, expected_type="refresh")
    service = AdminService(db)
    admin = await service.get_admin(token_data.admin_id)
    if not admin.is_active:
        raise ValidationError("Admin account is deactivated.")

    access_token = create_access_token(admin.id, admin.email, admin.role.value)
    refresh_token = payload.refresh_token
    log_info("Refresh token issued", email=admin.email)
    return {"access_token": access_token, "refresh_token": refresh_token}
