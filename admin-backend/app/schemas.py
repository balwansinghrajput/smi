from enum import Enum
from typing import List

from pydantic import BaseModel, Field, HttpUrl


class ProductStatus(str, Enum):
    active = "active"
    archive = "archive"
    draft = "draft"


class ProductBase(BaseModel):
    product_title: str = Field(..., min_length=1)
    sub_title: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    product_description: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    status: ProductStatus
    tags: List[str] = Field(default_factory=list)


class ProductInDB(ProductBase):
    id: str = Field(..., alias="_id")
    image_url: HttpUrl

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "id": "6429e18b7b9f3c53d5d6b9e1",
                "product_title": "Sample Product",
                "sub_title": "Best choice",
                "category": "electronics",
                "product_description": "A useful electronics product.",
                "image_url": "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg",
                "price": 99.99,
                "stock": 10,
                "status": "active",
                "tags": ["featured", "sale"]
            }
        }


class PaginationMeta(BaseModel):
    current_page: int
    total_pages: int
    total_products: int
    has_next_page: bool
    has_previous_page: bool


class PaginatedProducts(BaseModel):
    products: List[ProductInDB]
    pagination: PaginationMeta
