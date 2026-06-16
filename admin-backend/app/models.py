from pydantic import BaseModel, Field, HttpUrl
from typing import List


class ProductModel(BaseModel):
    product_title: str = Field(...)
    sub_title: str = Field(...)
    category: str = Field(...)
    product_description: str = Field(...)
    image_url: HttpUrl
    price: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    status: str = Field(...)
    tags: List[str] = Field(default_factory=list)
