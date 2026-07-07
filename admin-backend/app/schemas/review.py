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
    author: Optional[str] = None
    # Enriched user information
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    # Enriched product information
    product_title: Optional[str] = None
    # Timestamps
    created_at: Optional[str] = None

    class Config:
        validate_by_name = True


class PaginatedReviews(BaseModel):
    reviews: List[ReviewResponse]
    pagination: dict
