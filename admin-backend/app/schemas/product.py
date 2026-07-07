from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl


class ProductStatus(str, Enum):
    active = "active"
    archive = "archive"
    draft = "draft"


class ProductCreateRequest(BaseModel):
    product_title: str = Field(..., min_length=1)
    sub_title: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    product_description: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    status: ProductStatus
    tags: Optional[List[str]] = Field(default_factory=list)
    has_shipping: bool = True


class ProductUpdateRequest(BaseModel):
    product_title: Optional[str] = Field(None, min_length=1)
    sub_title: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1)
    product_description: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    status: Optional[ProductStatus] = None
    tags: Optional[List[str]] = None
    has_shipping: Optional[bool] = None


class ProductResponse(BaseModel):
    id: str = Field(..., alias="_id")
    product_title: str
    sub_title: str
    category: str
    product_description: str
    image_url: HttpUrl
    cloudinary_public_id: str
    price: float
    stock: int
    status: ProductStatus
    tags: List[str]
    has_shipping: bool

    class Config:
        validate_by_name = True


class PaginationMeta(BaseModel):
    current_page: int
    total_pages: int
    total_products: int
    has_next_page: bool
    has_previous_page: bool


class PaginatedProducts(BaseModel):
    products: List[ProductResponse]
    pagination: PaginationMeta
