from typing import List
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field

from app.core.database import get_database


class DeliveryMethodResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    description: str
    charge: float
    estimated_days: str

    class Config:
        validate_by_name = True


router = APIRouter(prefix="/shipping/methods", tags=["Shipping"])


@router.get("/", response_model=List[DeliveryMethodResponse])
async def get_active_delivery_methods(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get all active delivery methods for checkout"""
    collection = db["delivery_methods"]
    cursor = collection.find({"is_active": True}).sort("slot", 1)
    methods = await cursor.to_list(length=100)
    for method in methods:
        method["_id"] = str(method["_id"])
    return methods
