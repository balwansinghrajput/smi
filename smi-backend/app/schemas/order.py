from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.cart import CartItemOut


PaymentMethod = Literal["cod", "online", "upi", "card"]
DeliveryOption = Literal["standard", "express"]


class ShippingAddress(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    email: EmailStr
    address: str = Field(..., min_length=5, max_length=300)
    city: str = Field(..., min_length=2, max_length=80)
    state: str = Field(..., min_length=2, max_length=80)
    pincode: str = Field(..., min_length=4, max_length=12)


class CheckoutRequest(BaseModel):
    shippingAddress: ShippingAddress
    deliveryOption: DeliveryOption = "standard"
    paymentMethod: PaymentMethod = "cod"
    couponCode: Optional[str] = None  # User-applied coupon code


class PaymentInfo(BaseModel):
    method: str
    status: str
    provider: str | None = None
    paymentUrl: str | None = None
    transactionId: str | None = None
    paidAmount: float | None = None


class OrderOut(BaseModel):
    id: str
    userId: str
    items: list[CartItemOut]
    shippingAddress: ShippingAddress
    subtotal: float
    shipping: float
    tax: float
    discount: float = 0.0
    total: float
    totalQuantity: int
    deliveryOption: str
    payment: PaymentInfo
    status: str
    couponCode: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime | None = None


class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
