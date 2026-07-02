from typing import Optional
from pydantic import BaseModel, Field

class SettingUpdateRequest(BaseModel):
    site_name: Optional[str] = None
    currency: Optional[str] = None
    tax_rate: Optional[float] = None
    shipping_fee: Optional[float] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None

class SettingResponse(BaseModel):
    id: str = Field(..., alias="_id")
    site_name: str
    currency: str
    tax_rate: float
    shipping_fee: float
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        validate_by_name = True
