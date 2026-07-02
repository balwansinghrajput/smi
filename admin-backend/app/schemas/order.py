from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.order import OrderItem, ShippingAddress, PaymentInfo

class OrderCreateRequest(BaseModel):
    userId: str
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    subtotal: float
    shipping: float
    tax: float
    total: float
    totalQuantity: int
    deliveryOption: str
    payment: PaymentInfo

class OrderStatusUpdateRequest(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None

class OrderResponse(BaseModel):
    id: str = Field(..., alias="_id")
    userId: str
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    subtotal: float
    shipping: float
    tax: float
    total: float
    totalQuantity: int
    deliveryOption: str
    payment: PaymentInfo
    status: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        validate_by_name = True

class PaginatedOrders(BaseModel):
    orders: List[OrderResponse]
    pagination: dict

