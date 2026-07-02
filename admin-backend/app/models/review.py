from typing import Optional
from pydantic import BaseModel, Field

class ReviewDocument(BaseModel):
    user_id: str
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str
    status: str = "pending" # pending, approved, rejected
