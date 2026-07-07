from typing import Any, Dict

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.review import ReviewStatusUpdateRequest, ReviewResponse, PaginatedReviews


class ReviewService:
    COLLECTION_NAME = "reviews"
    USERS_COLLECTION = "users"
    PRODUCTS_COLLECTION = "products"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _build_review_from_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalise a raw MongoDB document (which may use camelCase from the SMI
        backend) into the snake_case shape expected by ReviewResponse.
        Also merges in enriched user / product sub-documents when present.
        """
        if document is None:
            return document

        # Support both camelCase (SMI backend) and snake_case field names
        user_id = document.get("userId") or document.get("user_id", "")
        product_id = document.get("productId") or document.get("product_id", "")
        author = document.get("author") or document.get("user_name")
        status = document.get("status", "pending")
        rating = document.get("rating", 0)
        comment = document.get("comment", "")

        # Enriched sub-docs injected by the aggregation pipeline
        user_doc = document.get("user_info")
        product_doc = document.get("product_info")

        user_name = None
        user_email = None
        if user_doc:
            user_name = user_doc.get("name")
            user_email = user_doc.get("email")
        # Fall back to the author field stored on the review itself
        if not user_name:
            user_name = author

        product_title = None
        if product_doc:
            product_title = product_doc.get("product_title") or product_doc.get("name")

        # ISO timestamp
        created_at = None
        raw_ts = document.get("createdAt") or document.get("created_at")
        if raw_ts:
            try:
                created_at = raw_ts.isoformat() if hasattr(raw_ts, "isoformat") else str(raw_ts)
            except Exception:
                created_at = str(raw_ts)

        return {
            "_id": document["_id"],
            "user_id": user_id,
            "product_id": product_id,
            "rating": rating,
            "comment": comment,
            "status": status,
            "author": author,
            "user_name": user_name,
            "user_email": user_email,
            "product_title": product_title,
            "created_at": created_at,
        }

    def _build_enrichment_pipeline(self, extra_stages: list = None) -> list:
        """
        Returns a MongoDB aggregation pipeline that:
          1. Converts the string userId → ObjectId so we can $lookup into users.
          2. Converts the string productId → ObjectId so we can $lookup into products.
          3. Merges a single user sub-doc and a single product sub-doc into each review.
        """
        pipeline = [
            # ── user lookup ──────────────────────────────────────────────────
            {
                "$addFields": {
                    "userObjId": {
                        "$convert": {
                            "input": {"$ifNull": ["$userId", "$user_id"]},
                            "to": "objectId",
                            "onError": None,
                            "onNull": None,
                        }
                    },
                    "productObjId": {
                        "$convert": {
                            "input": {"$ifNull": ["$productId", "$product_id"]},
                            "to": "objectId",
                            "onError": None,
                            "onNull": None,
                        }
                    },
                }
            },
            {
                "$lookup": {
                    "from": self.USERS_COLLECTION,
                    "localField": "userObjId",
                    "foreignField": "_id",
                    "as": "user_info",
                    "pipeline": [{"$project": {"name": 1, "email": 1}}],
                }
            },
            {
                "$lookup": {
                    "from": self.PRODUCTS_COLLECTION,
                    "localField": "productObjId",
                    "foreignField": "_id",
                    "as": "product_info",
                    "pipeline": [{"$project": {"product_title": 1, "name": 1}}],
                }
            },
            {
                "$addFields": {
                    "user_info": {"$arrayElemAt": ["$user_info", 0]},
                    "product_info": {"$arrayElemAt": ["$product_info", 0]},
                }
            },
        ]

        if extra_stages:
            pipeline.extend(extra_stages)

        return pipeline

    async def list_reviews(self, page: int = 1, page_size: int = 50) -> PaginatedReviews:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_reviews = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_reviews + page_size - 1) // page_size, 1)

        pipeline = self._build_enrichment_pipeline(
            extra_stages=[
                {"$sort": {"createdAt": -1}},
                {"$skip": skip},
                {"$limit": page_size},
            ]
        )

        cursor = self.db[self.COLLECTION_NAME].aggregate(pipeline)
        reviews = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            normalized = self._build_review_from_document(doc)
            reviews.append(ReviewResponse(**normalized))

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

        pipeline = [{"$match": {"_id": object_id}}] + self._build_enrichment_pipeline()
        cursor = self.db[self.COLLECTION_NAME].aggregate(pipeline)
        doc = await cursor.to_list(length=1)
        if not doc:
            raise LookupError("Review not found.")

        doc = doc[0]
        doc["_id"] = str(doc["_id"])
        return ReviewResponse(**self._build_review_from_document(doc))

    async def update_review_status(
        self,
        review_id: str,
        payload: ReviewStatusUpdateRequest,
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

        await self.db[self.COLLECTION_NAME].update_one(
            {"_id": object_id}, {"$set": {"status": payload.status}}
        )
        return await self.get_review(review_id)

    async def delete_review(self, review_id: str) -> None:
        try:
            object_id = ObjectId(review_id)
        except InvalidId:
            raise ValueError("Invalid review ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Review not found.")

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
