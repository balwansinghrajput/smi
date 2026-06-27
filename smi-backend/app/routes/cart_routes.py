from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.cart import CartAdd, CartOut, CartUpdate
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartOut)
async def get_cart(current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await CartService(db).get_cart(current_user["id"])


@router.post("/add", response_model=CartOut)
async def add_to_cart(payload: CartAdd, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await CartService(db).add(current_user["id"], payload)


@router.put("/update", response_model=CartOut)
async def update_cart(payload: CartUpdate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await CartService(db).update(current_user["id"], payload)


@router.put("/increase/{product_id}", response_model=CartOut)
async def increase_quantity(product_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await CartService(db).change(current_user["id"], product_id, 1)


@router.put("/decrease/{product_id}", response_model=CartOut)
async def decrease_quantity(product_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await CartService(db).change(current_user["id"], product_id, -1)


@router.delete("/remove/{product_id}", response_model=CartOut)
async def remove_item(product_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await CartService(db).remove(current_user["id"], product_id)


@router.delete("/clear", response_model=CartOut)
async def clear_cart(current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await CartService(db).clear(current_user["id"])

