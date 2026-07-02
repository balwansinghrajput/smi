from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.order import OrderItem, ShippingAddress

class OrderCreateRequest(BaseModel):
    user_id: str
    items: List[OrderItem]
    total_amount: float
    payment_method: str = "cod"
    shipping_address: ShippingAddress

class OrderStatusUpdateRequest(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None

class OrderResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    items: List[OrderItem]
    total_amount: float
    status: str
    payment_status: str
    payment_method: str
    shipping_address: ShippingAddress

    class Config:
        validate_by_name = True

class PaginatedOrders(BaseModel):
    orders: List[OrderResponse]
    pagination: dict
