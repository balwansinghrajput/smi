from typing import Any, Dict

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.review import ReviewStatusUpdateRequest, ReviewResponse, PaginatedReviews

class ReviewService:
    COLLECTION_NAME = "reviews"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize_review_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return document
        return document

    async def list_reviews(self, page: int = 1, page_size: int = 50) -> PaginatedReviews:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_reviews = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_reviews + page_size - 1) // page_size, 1)

        cursor = self.db[self.COLLECTION_NAME].find().skip(skip).limit(page_size)
        reviews = []
        async for review in cursor:
            review["_id"] = str(review["_id"])
            reviews.append(ReviewResponse(**self._normalize_review_document(review)))

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_reviews": total_reviews,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        }
        return PaginatedReviews(reviews=reviews, pagination=pagination)

    async def get_review(self, review_id: str) -> ReviewResponse:
        try:
            object_id = ObjectId(review_id)
        except InvalidId:
            raise ValueError("Invalid review ID format.")

        review = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not review:
            raise LookupError("Review not found.")

        review["_id"] = str(review["_id"])
        return ReviewResponse(**self._normalize_review_document(review))

    async def update_review_status(
        self,
        review_id: str,
        payload: ReviewStatusUpdateRequest
    ) -> ReviewResponse:
        try:
            object_id = ObjectId(review_id)
        except InvalidId:
            raise ValueError("Invalid review ID format.")
            
        if payload.status not in ["pending", "approved", "rejected"]:
            raise ValueError("Status must be one of: pending, approved, rejected")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Review not found.")

        await self.db[self.COLLECTION_NAME].update_one({"_id": object_id}, {"$set": {"status": payload.status}})
        updated = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        updated["_id"] = str(updated["_id"])
        return ReviewResponse(**self._normalize_review_document(updated))

    async def delete_review(self, review_id: str) -> None:
        try:
            object_id = ObjectId(review_id)
        except InvalidId:
            raise ValueError("Invalid review ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Review not found.")

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
