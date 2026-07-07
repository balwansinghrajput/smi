from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.review import ReviewStatusUpdateRequest, PaginatedReviews
from app.schemas.response import BaseResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])

def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})


@router.get("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_reviews(page: int = 1, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = ReviewService(db)
        page_data = await service.list_reviews(page=page, page_size=50)
        return BaseResponse(status="success", message="Reviews retrieved.", data=page_data.dict())
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/{review_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_review(review_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = ReviewService(db)
        review = await service.get_review(review_id)
        return BaseResponse(status="success", message="Review retrieved.", data=review.dict())
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.put("/{review_id}/status", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def update_review_status(
    review_id: str,
    payload: ReviewStatusUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = ReviewService(db)
        review = await service.update_review_status(review_id, payload)
        return BaseResponse(status="success", message="Review status updated.", data=review.dict())
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.delete("/{review_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def delete_review(
    review_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = ReviewService(db)
        await service.delete_review(review_id)
        return BaseResponse(status="success", message="Review deleted successfully.", data=None)
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)
