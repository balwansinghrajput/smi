from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.coupon import CouponCreateRequest, CouponUpdateRequest, PaginatedCoupons
from app.schemas.response import BaseResponse
from app.services.coupon_service import CouponService

router = APIRouter(prefix="/coupons", tags=["Coupons"])

def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})


@router.post("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def create_coupon(
    payload: CouponCreateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = CouponService(db)
        coupon = await service.create_coupon(payload)
        return BaseResponse(status="success", message="Coupon created.", data=coupon.dict(by_alias=True))
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_coupons(page: int = 1, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = CouponService(db)
        page_data = await service.list_coupons(page=page, page_size=50)
        return BaseResponse(status="success", message="Coupons retrieved.", data=page_data.dict())
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/{coupon_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_coupon(coupon_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = CouponService(db)
        coupon = await service.get_coupon(coupon_id)
        return BaseResponse(status="success", message="Coupon retrieved.", data=coupon.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.put("/{coupon_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def update_coupon(
    coupon_id: str,
    payload: CouponUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = CouponService(db)
        coupon = await service.update_coupon(coupon_id, payload)
        return BaseResponse(status="success", message="Coupon updated.", data=coupon.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.delete("/{coupon_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def delete_coupon(
    coupon_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = CouponService(db)
        await service.delete_coupon(coupon_id)
        return BaseResponse(status="success", message="Coupon deleted successfully.", data=None)
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)
