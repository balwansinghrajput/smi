from typing import List

from pydantic import BaseModel, Field, HttpUrl


class ProductDocument(BaseModel):
    product_title: str = Field(..., min_length=1)
    sub_title: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    product_description: str = Field(..., min_length=1)
    image_url: HttpUrl
    cloudinary_public_id: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    status: str = Field(...)
    tags: List[str] = Field(default_factory=list)
