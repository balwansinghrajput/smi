from fastapi import APIRouter, Depends, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.order import CheckoutRequest, OrderOut, OrderStatusUpdate
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut)
async def create_order(payload: CheckoutRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await OrderService(db).create_order(current_user["id"], payload, background_tasks)


@router.get("", response_model=list[OrderOut])
async def list_orders(current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await OrderService(db).list_orders(current_user["id"])


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await OrderService(db).get(current_user["id"], order_id)


@router.put("/cancel/{order_id}", response_model=OrderOut)
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await OrderService(db).cancel(current_user["id"], order_id)


@router.put("/status/{order_id}", response_model=OrderOut)
async def update_order_status(order_id: str, payload: OrderStatusUpdate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await OrderService(db).status(current_user["id"], order_id, payload)

