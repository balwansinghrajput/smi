from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.services.product_service import ProductService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("")
async def get_categories(db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ProductService(db).categories()

