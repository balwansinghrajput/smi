from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth.security import decode_access_token
from app.database.mongodb import get_database
from app.repositories.user_repository import UserRepository
from app.utils.errors import UnauthorizedError

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    if credentials is None:
        raise UnauthorizedError()
    payload = decode_access_token(credentials.credentials)
    user = await UserRepository(db).get_by_id(payload["sub"])
    if not user:
        raise UnauthorizedError("User no longer exists")
    return user

