from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    is_blocked: Optional[bool] = None

class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_blocked: bool

    class Config:
        validate_by_name = True

class PaginatedUsers(BaseModel):
    users: List[UserResponse]
    pagination: dict
