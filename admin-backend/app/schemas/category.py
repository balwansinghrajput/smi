from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl

class CategoryCreateRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    parent_id: Optional[str] = None

class CategoryUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    parent_id: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    cloudinary_public_id: Optional[str] = None

    class Config:
        validate_by_name = True

class PaginatedCategories(BaseModel):
    categories: List[CategoryResponse]
    pagination: dict
