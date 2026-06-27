from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth.security import create_access_token, hash_password, verify_password
from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse, UserLogin, UserOut, UserRegister, UserUpdate
from app.schemas.common import MessageResponse
from app.utils.errors import BadRequestError, UnauthorizedError

router = APIRouter(tags=["Authentication"])


def public_user(user: dict) -> UserOut:
    return UserOut(id=user["id"], name=user["name"], email=user["email"], phone=user.get("phone"))


@router.post("/register", response_model=AuthResponse)
async def register(payload: UserRegister, db: AsyncIOMotorDatabase = Depends(get_database)):
    repo = UserRepository(db)
    existing = await repo.get_by_email(payload.email)
    if existing:
        raise BadRequestError("Email already registered")
    user = await repo.create(
        {
            "name": payload.name.strip(),
            "email": payload.email.lower(),
            "phone": payload.phone.strip(),
            "passwordHash": hash_password(payload.password),
        }
    )
    token = create_access_token(user["id"], {"email": user["email"]})
    return AuthResponse(user=public_user(user), token=token)


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await UserRepository(db).get_by_email(payload.email)
    if not user or not verify_password(payload.password, user["passwordHash"]):
        raise UnauthorizedError("Invalid email or password")
    token = create_access_token(user["id"], {"email": user["email"]})
    return AuthResponse(user=public_user(user), token=token)


@router.post("/logout", response_model=MessageResponse)
async def logout():
    return MessageResponse(message="Logged out successfully")


@router.get("/profile", response_model=UserOut)
async def profile(current_user: dict = Depends(get_current_user)):
    return public_user(current_user)


@router.put("/profile", response_model=UserOut)
async def update_profile(
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    data = payload.model_dump(exclude_unset=True)
    user = await UserRepository(db).update(current_user["id"], data)
    return public_user(user)

