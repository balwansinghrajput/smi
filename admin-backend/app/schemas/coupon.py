from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class CouponCreateRequest(BaseModel):
    code: str = Field(..., min_length=3)
    discount_type: str = Field(..., description="percentage or fixed")
    discount_value: float = Field(..., gt=0)
    min_order_amount: Optional[float] = Field(default=0)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True

class CouponUpdateRequest(BaseModel):
    code: Optional[str] = Field(None, min_length=3)
    discount_type: Optional[str] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_order_amount: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None

class CouponResponse(BaseModel):
    id: str = Field(..., alias="_id")
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool

    class Config:
        validate_by_name = True

class PaginatedCoupons(BaseModel):
    coupons: List[CouponResponse]
    pagination: dict
