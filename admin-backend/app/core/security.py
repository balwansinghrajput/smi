from datetime import datetime, timedelta
import re
from typing import Any, Dict

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings
from app.utils.errors import AuthenticationError, ValidationError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PASSWORD_PATTERN = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    if not PASSWORD_PATTERN.match(password):
        raise ValidationError(
            "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
        )
    return pwd_context.hash(password)


class TokenPayload(BaseModel):
    admin_id: str
    email: str
    role: str
    type: str
    exp: int


def _create_token(claims: Dict[str, Any], expires_delta: timedelta) -> str:
    payload = claims.copy()
    expire = datetime.utcnow() + expires_delta
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(admin_id: str, email: str, role: str) -> str:
    return _create_token(
        {"admin_id": admin_id, "email": email, "role": role, "type": "access"},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(admin_id: str, email: str, role: str) -> str:
    return _create_token(
        {"admin_id": admin_id, "email": email, "role": role, "type": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str, expected_type: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        token_data = TokenPayload(**payload)
    except JWTError as exc:
        raise AuthenticationError("Invalid or expired authentication token.") from exc
    except Exception as exc:
        raise AuthenticationError("Token payload is malformed.") from exc

    if token_data.type != expected_type:
        raise AuthenticationError("Token type mismatch.")

    return token_data
