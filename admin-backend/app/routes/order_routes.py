from fastapi import APIRouter, Depends, Body
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.order import OrderCreateRequest, OrderStatusUpdateRequest, PaginatedOrders
from app.schemas.response import BaseResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])

def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})

# Note: Orders are typically created by customers. This endpoint is for testing or manual admin creation.
@router.post("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def create_order(
    payload: OrderCreateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = OrderService(db)
        order = await service.create_order(payload)
        return BaseResponse(status="success", message="Order created.", data=order.dict(by_alias=True))
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_orders(page: int = 1, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = OrderService(db)
        page_data = await service.list_orders(page=page, page_size=20)
        return BaseResponse(status="success", message="Orders retrieved.", data=page_data.dict())
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/{order_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_order(order_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = OrderService(db)
        order = await service.get_order(order_id)
        return BaseResponse(status="success", message="Order retrieved.", data=order.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.put("/{order_id}/status", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = OrderService(db)
        order = await service.update_order_status(order_id, payload)
        return BaseResponse(status="success", message="Order status updated.", data=order.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.delete("/{order_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin"))])
async def delete_order(
    order_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = OrderService(db)
        await service.delete_order(order_id)
        return BaseResponse(status="success", message="Order deleted successfully.", data=None)
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)
