from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.product import ProductCreateRequest, ProductUpdateRequest, ProductResponse, PaginatedProducts
from app.schemas.response import BaseResponse, DeleteProductResponse
from app.services.product_service import ProductService
from app.utils.logging import log_info

router = APIRouter(prefix="/products", tags=["Products"])


def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})


@router.post("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def create_product(
    product_title: str = Form(...),
    sub_title: str = Form(...),
    category: str = Form(...),
    product_description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    status: str = Form(...),
    tags: str = Form(""),
    product_image: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    print("------------------ product create request -----------------")
    try:
        payload = ProductCreateRequest(
            product_title=product_title,
            sub_title=sub_title,
            category=category,
            product_description=product_description,
            price=price,
            stock=stock,
            status=status,
            tags=[tag.strip() for tag in tags.split(",") if tag.strip()],
        )
        service = ProductService(db)
        print("------------------ product service created -----------------" , service)
        product = await service.create_product(payload, product_image)
        print("------------------ product created successfully -----------------")
        return BaseResponse(status="success", message="Product created.", data=product.dict(by_alias=True))
    except Exception as exc:
        print("---------- error 404 -------" , exc)
        return _format_error(str(exc), 400)


@router.get("/", response_model=BaseResponse)
async def get_products(page: int = 1, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = ProductService(db)
        page_data = await service.list_products(page=page, page_size=10)
        return BaseResponse(status="success", message="Products retrieved.", data=page_data.dict())
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/{product_id}", response_model=BaseResponse)
async def get_product(product_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = ProductService(db)
        product = await service.get_product(product_id)
        return BaseResponse(status="success", message="Product retrieved.", data=product.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.put("/{product_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def update_product(
    product_id: str,
    product_title: str | None = Form(None),
    sub_title: str | None = Form(None),
    category: str | None = Form(None),
    product_description: str | None = Form(None),
    price: float | None = Form(None),
    stock: int | None = Form(None),
    status: str | None = Form(None),
    tags: str | None = Form(None),
    product_image: UploadFile | None = File(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    print("------------------ product update request 1.0-----------------")
    try:
        print("------------------ product update request -----------------")
        payload = ProductUpdateRequest(
            product_title=product_title,
            sub_title=sub_title,
            category=category,
            product_description=product_description,
            price=price,
            stock=stock,
            status=status,
            tags=[tag.strip() for tag in tags.split(",") if tag.strip()] if tags is not None else None,
        )
        service = ProductService(db)
        product = await service.update_product(product_id, payload, image=product_image)
        return BaseResponse(status="success", message="Product updated.", data=product.dict(by_alias=True))
    except ValueError as exc:
        print("------------------ product value error -----------------")
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except RuntimeError as exc:
        return _format_error(str(exc), 502)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.delete("/{product_id}", response_model=DeleteProductResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def delete_product(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = ProductService(db)
        await service.delete_product(product_id)
        return DeleteProductResponse(status="success", message="Product deleted successfully.")
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except RuntimeError as exc:
        return _format_error(str(exc), 502)
    except Exception as exc:
        return _format_error(str(exc), 500)
