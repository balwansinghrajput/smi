from typing import Optional
from pydantic import BaseModel

class SettingDocument(BaseModel):
    site_name: str = "SMI E-Commerce"
    currency: str = "USD"
    tax_rate: float = 0.0
    shipping_fee: float = 0.0
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
