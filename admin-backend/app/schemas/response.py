from pydantic import BaseModel
from typing import Any


class BaseResponse(BaseModel):
    status: str = "success"
    message: str
    data: Any


class DeleteProductResponse(BaseModel):
    status: str = "success"
    message: str


class SingleProductResponse(BaseResponse):
    data: Any


class ProductListResponse(BaseResponse):
    data: Any
