from typing import Any

from pydantic import BaseModel, Field


class ProductOut(BaseModel):
    id: str
    name: str
    slug: str
    categoryId: str
    category: str
    brand: str | None = None
    price: float
    originalPrice: float | None = None
    rating: float = 0
    reviewCount: int = 0
    inStock: bool
    stockCount: int
    isFeatured: bool = False
    isBestSelling: bool = False
    isNew: bool = False
    images: list[str] = Field(default_factory=list)
    capacity: str | None = None
    voltage: str | None = None
    warranty: str | None = None
    description: str
    specifications: dict[str, Any] = Field(default_factory=dict)
    keywords: list[str] = Field(default_factory=list)
    createdAt: str | None = None
    hasShipping: bool = True


class ProductPage(BaseModel):
    products: list[ProductOut]
    currentPage: int
    totalPages: int
    totalProducts: int
    hasNext: bool
    hasPrevious: bool

