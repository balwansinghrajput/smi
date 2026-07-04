from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    id: str
    productId: str
    quantity: int
    product: Dict[str, Any]
    lineTotal: float

class ShippingAddress(BaseModel):
    fullName: str
    phone: str
    email: str
    address: str
    city: str
    state: str
    pincode: str

class PaymentInfo(BaseModel):
    method: str
    status: str
    provider: Optional[str] = None
    paymentUrl: Optional[str] = None
    transactionId: Optional[str] = None
    paidAmount: Optional[float] = None

class OrderDocument(BaseModel):
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
    status: str = Field(default="pending")
