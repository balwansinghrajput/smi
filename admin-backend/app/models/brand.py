from typing import Optional
from pydantic import BaseModel, Field, HttpUrl

class BrandDocument(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    cloudinary_public_id: Optional[str] = None
