from typing import Optional
from pydantic import BaseModel, Field, HttpUrl

class CategoryDocument(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    parent_id: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    cloudinary_public_id: Optional[str] = None
