from typing import Optional

from pydantic import BaseModel, Field


class DeliveryMethodCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=200)
    charge: float = Field(..., ge=0)
    estimated_days: str = Field(..., min_length=1, max_length=50)
    is_active: bool = True


class DeliveryMethodUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    charge: Optional[float] = Field(None, ge=0)
    estimated_days: Optional[str] = Field(None, min_length=1, max_length=50)
    is_active: Optional[bool] = None


class DeliveryMethodResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    description: str
    charge: float
    estimated_days: str
    is_active: bool
    slot: int

    class Config:
        validate_by_name = True
