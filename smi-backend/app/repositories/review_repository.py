from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.utils.object_id import stringify_id, validate_object_id


class ReviewRepository:
    collection_name = "reviews"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[self.collection_name]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index([("productId", 1), ("userId", 1)], unique=True)

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        document = {**data, "createdAt": now, "updatedAt": now}
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return stringify_id(document)

    async def list_by_product(self, product_id: str) -> list[dict]:
        cursor = self.collection.find({"productId": product_id}).sort("createdAt", -1)
        return [stringify_id(doc) async for doc in cursor]

    async def get_by_id(self, review_id: str) -> dict | None:
        object_id = validate_object_id(review_id, "review id")
        return stringify_id(await self.collection.find_one({"_id": object_id}))

    async def update(self, review_id: str, data: dict) -> dict | None:
        object_id = validate_object_id(review_id, "review id")
        await self.collection.update_one(
            {"_id": object_id},
            {"$set": {**data, "updatedAt": datetime.now(timezone.utc)}},
        )
        return stringify_id(await self.collection.find_one({"_id": object_id}))

    async def delete(self, review_id: str) -> None:
        object_id = validate_object_id(review_id, "review id")
        await self.collection.delete_one({"_id": object_id})

    async def list_featured(self, limit: int = 4) -> list[dict]:
        # Fetch 5-star reviews to use as featured testimonials
        cursor = self.collection.find({"rating": 5}).sort("createdAt", -1).limit(limit)
        return [stringify_id(doc) async for doc in cursor]
