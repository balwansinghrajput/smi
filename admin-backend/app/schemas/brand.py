from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl

class BrandCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None

class BrandUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None

class BrandResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    cloudinary_public_id: Optional[str] = None

    class Config:
        validate_by_name = True

class PaginatedBrands(BaseModel):
    brands: List[BrandResponse]
    pagination: dict
