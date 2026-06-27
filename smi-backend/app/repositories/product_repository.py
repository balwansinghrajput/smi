from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.utils.object_id import stringify_id, validate_object_id


class ProductRepository:
    collection_name = "products"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[self.collection_name]

    def active_filter(self) -> dict[str, Any]:
        return {"status": {"$ne": "archive"}}

    async def list(self, page: int, page_size: int, filters: dict | None = None) -> tuple[list[dict], int]:
        query = {**self.active_filter(), **(filters or {})}
        skip = (page - 1) * page_size
        total = await self.collection.count_documents(query)
        cursor = self.collection.find(query).sort("_id", -1).skip(skip).limit(page_size)
        return [stringify_id(doc) async for doc in cursor], total

    async def search(self, q: str, page: int, page_size: int) -> tuple[list[dict], int]:
        pattern = {"$regex": q, "$options": "i"}
        query = {
            **self.active_filter(),
            "$or": [
                {"product_title": pattern},
                {"sub_title": pattern},
                {"category": pattern},
                {"brand": pattern},
                {"tags": pattern},
                {"keywords": pattern},
                {"product_description": pattern},
            ],
        }
        skip = (page - 1) * page_size
        total = await self.collection.count_documents(query)
        cursor = self.collection.find(query).sort("_id", -1).skip(skip).limit(page_size)
        return [stringify_id(doc) async for doc in cursor], total

    async def get_by_id(self, product_id: str) -> dict | None:
        object_id = validate_object_id(product_id, "product id")
        return stringify_id(await self.collection.find_one({"_id": object_id, **self.active_filter()}))

    async def related(self, product: dict, limit: int = 4) -> list[dict]:
        category = product.get("category")
        cursor = self.collection.find(
            {"_id": {"$ne": ObjectId(product["id"])}, "category": category, **self.active_filter()}
        ).limit(limit)
        return [stringify_id(doc) async for doc in cursor]

    async def categories(self) -> list[dict]:
        categories = await self.collection.distinct("category", self.active_filter())
        output = []
        for category in sorted(filter(None, categories)):
            count = await self.collection.count_documents({"category": category, **self.active_filter()})
            sample = await self.collection.find_one({"category": category, **self.active_filter()})
            sample_images = (sample or {}).get("images") or []
            output.append(
                {
                    "id": category,
                    "name": category,
                    "slug": category.lower().replace(" ", "-"),
                    "image": (sample or {}).get("image_url") or (sample_images[0] if sample_images else ""),
                    "productCount": count,
                }
            )
        return output
