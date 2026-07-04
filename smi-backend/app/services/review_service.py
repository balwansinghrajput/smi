from datetime import datetime

from pymongo.errors import DuplicateKeyError
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.review_repository import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewOut, ReviewSummary, ReviewUpdate
from app.services.product_service import ProductService
from app.utils.errors import BadRequestError, ForbiddenError, NotFoundError


class ReviewService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.repository = ReviewRepository(db)
        self.products = ProductService(db)

    def normalize(self, doc: dict) -> ReviewOut:
        created = doc.get("createdAt") or datetime.utcnow()
        return ReviewOut(
            id=doc["id"],
            productId=doc["productId"],
            userId=doc["userId"],
            author=doc.get("author", "Customer"),
            rating=doc["rating"],
            comment=doc["comment"],
            date=created.date().isoformat(),
            createdAt=created,
            updatedAt=doc.get("updatedAt"),
        )

    async def summary(self, product_id: str) -> ReviewSummary:
        await self.products.get(product_id)
        docs = await self.repository.list_by_product(product_id)
        reviews = [self.normalize(doc) for doc in docs]
        total = len(reviews)
        average = round(sum(review.rating for review in reviews) / total, 1) if total else 0
        return ReviewSummary(reviews=reviews, averageRating=average, totalReviews=total)

    async def create(self, payload: ReviewCreate, user: dict) -> ReviewSummary:
        await self.products.get(payload.productId)
        try:
            await self.repository.create(
                {
                    "productId": payload.productId,
                    "userId": user["id"],
                    "author": user.get("name", "Customer"),
                    "rating": payload.rating,
                    "comment": payload.comment.strip(),
                }
            )
        except DuplicateKeyError as exc:
            raise BadRequestError("You have already reviewed this product") from exc
        return await self.summary(payload.productId)

    async def update(self, review_id: str, payload: ReviewUpdate, user: dict) -> ReviewSummary:
        existing = await self.repository.get_by_id(review_id)
        if not existing:
            raise NotFoundError("Review not found")
        if existing["userId"] != user["id"]:
            raise ForbiddenError("You can update only your own review")
        data = payload.model_dump(exclude_unset=True)
        if "comment" in data and data["comment"] is not None:
            data["comment"] = data["comment"].strip()
        updated = await self.repository.update(review_id, data)
        return await self.summary(updated["productId"])

    async def delete(self, review_id: str, user: dict) -> ReviewSummary:
        existing = await self.repository.get_by_id(review_id)
        if not existing:
            raise NotFoundError("Review not found")
        if existing["userId"] != user["id"]:
            raise ForbiddenError("You can delete only your own review")
        await self.repository.delete(review_id)
        return await self.summary(existing["productId"])

    async def featured_testimonials(self, limit: int = 4) -> list[ReviewOut]:
        docs = await self.repository.list_featured(limit)
        return [self.normalize(doc) for doc in docs]
