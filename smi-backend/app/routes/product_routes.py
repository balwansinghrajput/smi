from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.schemas.product import ProductOut, ProductPage
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=ProductPage)
async def get_products(
    page: int = Query(1, ge=1),
    category: str | None = None,
    featured: bool | None = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    return await ProductService(db).list_products(page=page, category=category, featured=featured)


@router.get("/search", response_model=ProductPage)
async def search_products(q: str = Query(..., min_length=1), page: int = Query(1, ge=1), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ProductService(db).search(q=q, page=page)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ProductService(db).get(product_id)


@router.get("/{product_id}/related", response_model=list[ProductOut])
async def related_products(product_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ProductService(db).related(product_id)

