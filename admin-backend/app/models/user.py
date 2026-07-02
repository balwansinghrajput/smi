from typing import Optional
from pydantic import BaseModel, EmailStr

class UserDocument(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "customer"
    is_blocked: bool = False
