from typing import List, Optional
from pydantic import BaseModel, Field

class ReviewStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Must be pending, approved, or rejected")

class ReviewResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    product_id: str
    rating: int
    comment: str
    status: str

    class Config:
        validate_by_name = True

class PaginatedReviews(BaseModel):
    reviews: List[ReviewResponse]
    pagination: dict
