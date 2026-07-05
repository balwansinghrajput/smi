from fastapi import APIRouter, Depends, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.order import CheckoutRequest, OrderOut
from app.services.order_service import OrderService

router = APIRouter(prefix="/checkout", tags=["Checkout"])


@router.post("", response_model=OrderOut)
async def checkout(payload: CheckoutRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await OrderService(db).create_order(current_user["id"], current_user["email"], payload, background_tasks)

