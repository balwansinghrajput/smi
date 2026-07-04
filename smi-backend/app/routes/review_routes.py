from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.review import ReviewCreate, ReviewSummary, ReviewUpdate, ReviewOut
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewSummary)
async def add_review(payload: ReviewCreate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ReviewService(db).create(payload, current_user)


@router.get("/featured", response_model=list[ReviewOut])
async def featured_reviews(db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ReviewService(db).featured_testimonials()


@router.get("/product/{product_id}", response_model=ReviewSummary)
async def product_reviews(product_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ReviewService(db).summary(product_id)


@router.put("/{review_id}", response_model=ReviewSummary)
async def update_review(review_id: str, payload: ReviewUpdate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ReviewService(db).update(review_id, payload, current_user)


@router.delete("/{review_id}", response_model=ReviewSummary)
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    return await ReviewService(db).delete(review_id, current_user)
