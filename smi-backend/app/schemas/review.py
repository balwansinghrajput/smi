from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    productId: str
    comment: str = Field(..., min_length=2, max_length=1000)
    rating: int = Field(..., ge=1, le=5)


class ReviewUpdate(BaseModel):
    comment: str | None = Field(None, min_length=2, max_length=1000)
    rating: int | None = Field(None, ge=1, le=5)


class ReviewOut(BaseModel):
    id: str
    productId: str
    userId: str
    author: str
    rating: int
    comment: str
    date: str
    createdAt: datetime
    updatedAt: datetime | None = None


class ReviewSummary(BaseModel):
    reviews: list[ReviewOut]
    averageRating: float
    totalReviews: int

