from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class CouponDocument(BaseModel):
    code: str = Field(..., min_length=3)
    discount_type: str = Field(...) # percentage, fixed
    discount_value: float = Field(..., gt=0)
    min_order_amount: Optional[float] = Field(default=0)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
