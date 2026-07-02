from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.category import CategoryCreateRequest, CategoryUpdateRequest, PaginatedCategories
from app.schemas.response import BaseResponse
from app.services.category_service import CategoryService
from app.utils.logging import log_info

router = APIRouter(prefix="/categories", tags=["Categories"])

def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})


@router.post("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def create_category(
    title: str = Form(...),
    description: str | None = Form(None),
    parent_id: str | None = Form(None),
    category_image: UploadFile | None = File(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        payload = CategoryCreateRequest(
            title=title,
            description=description,
            parent_id=parent_id,
        )
        service = CategoryService(db)
        category = await service.create_category(payload, category_image)
        return BaseResponse(status="success", message="Category created.", data=category.dict(by_alias=True))
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/", response_model=BaseResponse)
async def get_categories(page: int = 1, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = CategoryService(db)
        page_data = await service.list_categories(page=page, page_size=100)
        return BaseResponse(status="success", message="Categories retrieved.", data=page_data.dict())
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/{category_id}", response_model=BaseResponse)
async def get_category(category_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = CategoryService(db)
        category = await service.get_category(category_id)
        return BaseResponse(status="success", message="Category retrieved.", data=category.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.put("/{category_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def update_category(
    category_id: str,
    title: str | None = Form(None),
    description: str | None = Form(None),
    parent_id: str | None = Form(None),
    category_image: UploadFile | None = File(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        payload = CategoryUpdateRequest(
            title=title,
            description=description,
            parent_id=parent_id,
        )
        service = CategoryService(db)
        category = await service.update_category(category_id, payload, image=category_image)
        return BaseResponse(status="success", message="Category updated.", data=category.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.delete("/{category_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def delete_category(
    category_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = CategoryService(db)
        await service.delete_category(category_id)
        return BaseResponse(status="success", message="Category deleted successfully.", data=None)
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)
