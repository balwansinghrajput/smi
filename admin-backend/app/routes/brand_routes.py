from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.brand import BrandCreateRequest, BrandUpdateRequest, PaginatedBrands
from app.schemas.response import BaseResponse
from app.services.brand_service import BrandService
from app.utils.logging import log_info

router = APIRouter(prefix="/brands", tags=["Brands"])

def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})


@router.post("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def create_brand(
    name: str = Form(...),
    description: str | None = Form(None),
    brand_image: UploadFile | None = File(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        payload = BrandCreateRequest(
            name=name,
            description=description,
        )
        service = BrandService(db)
        brand = await service.create_brand(payload, brand_image)
        return BaseResponse(status="success", message="Brand created.", data=brand.dict(by_alias=True))
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/", response_model=BaseResponse)
async def get_brands(page: int = 1, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = BrandService(db)
        page_data = await service.list_brands(page=page, page_size=100)
        return BaseResponse(status="success", message="Brands retrieved.", data=page_data.dict())
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/{brand_id}", response_model=BaseResponse)
async def get_brand(brand_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = BrandService(db)
        brand = await service.get_brand(brand_id)
        return BaseResponse(status="success", message="Brand retrieved.", data=brand.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.put("/{brand_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def update_brand(
    brand_id: str,
    name: str | None = Form(None),
    description: str | None = Form(None),
    brand_image: UploadFile | None = File(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        payload = BrandUpdateRequest(
            name=name,
            description=description,
        )
        service = BrandService(db)
        brand = await service.update_brand(brand_id, payload, image=brand_image)
        return BaseResponse(status="success", message="Brand updated.", data=brand.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.delete("/{brand_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def delete_brand(
    brand_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = BrandService(db)
        await service.delete_brand(brand_id)
        return BaseResponse(status="success", message="Brand deleted successfully.", data=None)
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)
