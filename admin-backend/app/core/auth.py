from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.security import decode_token
from app.services.admin_service import AdminService
from app.utils.errors import AuthenticationError, AuthorizationError

security = HTTPBearer(auto_error=False)


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AuthenticationError("Missing or invalid Authorization header.")

    token_data = decode_token(credentials.credentials, expected_type="access")
    service = AdminService(db)
    try:
        admin = await service.get_admin(token_data.admin_id)
    except Exception:
        raise AuthenticationError("Invalid authentication credentials.")

    if not admin.is_active:
        raise AuthenticationError("Admin account is deactivated.")
    return admin


def require_roles(*roles: str):
    async def role_checker(current_admin=Depends(get_current_admin)):
        if current_admin.role not in roles:
            raise AuthorizationError("Insufficient permissions for this resource.")
        return current_admin

    return role_checker
