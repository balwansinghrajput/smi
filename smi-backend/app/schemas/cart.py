from pydantic import BaseModel, Field

from app.schemas.product import ProductOut


class CartAdd(BaseModel):
    productId: str
    quantity: int = Field(1, ge=1)


class CartUpdate(BaseModel):
    productId: str
    quantity: int = Field(..., ge=1)


class CartItemOut(BaseModel):
    id: str
    productId: str
    quantity: int
    product: ProductOut
    lineTotal: float


class CartOut(BaseModel):
    items: list[CartItemOut]
    subtotal: float
    shipping: float
    tax: float
    total: float
    totalQuantity: int
    stockValid: bool
    stockErrors: list[str] = Field(default_factory=list)

