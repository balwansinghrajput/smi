from typing import List, Optional
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    image_url: Optional[str] = None

class ShippingAddress(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: str

class OrderDocument(BaseModel):
    user_id: str
    items: List[OrderItem]
    total_amount: float
    status: str = Field(default="pending") # pending, processing, shipped, delivered, cancelled, refunded
    payment_status: str = Field(default="pending") # pending, paid, failed, refunded
    payment_method: str = Field(default="cod") # cod, online
    shipping_address: ShippingAddress
