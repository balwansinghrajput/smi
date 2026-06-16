from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class AdminRole(str, Enum):
    super_admin = "super_admin"
    admin = "admin"


class AdminBase(BaseModel):
    email: EmailStr
    phone_number: str = Field(..., min_length=8, max_length=20)
    role: AdminRole
    is_active: bool = True


class AdminCreateRequest(AdminBase):
    password: str = Field(..., min_length=8)


class AdminUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    phone_number: Optional[str] = Field(None, min_length=8, max_length=20)
    role: Optional[AdminRole] = None
    is_active: Optional[bool] = None


class AdminResponse(BaseModel):
    id: str = Field(..., alias="_id")
    email: EmailStr
    phone_number: str
    role: AdminRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        validate_by_name = True


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AdminListResponse(BaseModel):
    admins: List[AdminResponse]
    pagination: dict
