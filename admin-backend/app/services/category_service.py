from typing import Any, Dict, Optional

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.category import CategoryCreateRequest, CategoryUpdateRequest, CategoryResponse, PaginatedCategories
from app.services.cloudinary import cloudinary_service


class CategoryService:
    COLLECTION_NAME = "categories"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize_category_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return document
        return document

    async def create_category(self, payload: CategoryCreateRequest, image: Optional[Any] = None) -> CategoryResponse:
        document = {
            "title": payload.title,
            "description": payload.description,
            "parent_id": payload.parent_id,
            "image_url": None,
            "cloudinary_public_id": None,
        }

        if image:
            upload_result = await cloudinary_service.upload_image(image)
            document["image_url"] = upload_result["secure_url"]
            document["cloudinary_public_id"] = upload_result["public_id"]

        result = await self.db[self.COLLECTION_NAME].insert_one(document)
        document["_id"] = str(result.inserted_id)
        return CategoryResponse(**self._normalize_category_document(document))

    async def list_categories(self, page: int = 1, page_size: int = 100) -> PaginatedCategories:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_categories = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_categories + page_size - 1) // page_size, 1)

        cursor = self.db[self.COLLECTION_NAME].find().skip(skip).limit(page_size)
        categories = []
        async for category in cursor:
            category["_id"] = str(category["_id"])
            categories.append(CategoryResponse(**self._normalize_category_document(category)))

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_categories": total_categories,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        }
        return PaginatedCategories(categories=categories, pagination=pagination)

    async def get_category(self, category_id: str) -> CategoryResponse:
        try:
            object_id = ObjectId(category_id)
        except InvalidId:
            raise ValueError("Invalid category ID format.")

        category = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not category:
            raise LookupError("Category not found.")

        category["_id"] = str(category["_id"])
        return CategoryResponse(**self._normalize_category_document(category))

    async def update_category(
        self,
        category_id: str,
        payload: CategoryUpdateRequest,
        image: Optional[Any] = None,
    ) -> CategoryResponse:
        try:
            object_id = ObjectId(category_id)
        except InvalidId:
            raise ValueError("Invalid category ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Category not found.")

        update_data = {}
        if payload.title is not None:
            update_data["title"] = payload.title
        if payload.description is not None:
            update_data["description"] = payload.description
        if payload.parent_id is not None:
            update_data["parent_id"] = payload.parent_id

        if image is not None:
            old_public_id = existing.get("cloudinary_public_id")
            if old_public_id:
                await cloudinary_service.delete_image(old_public_id)
            upload_result = await cloudinary_service.upload_image(image)
            update_data["image_url"] = upload_result["secure_url"]
            update_data["cloudinary_public_id"] = upload_result["public_id"]

        if not update_data:
            raise ValueError("No update fields were provided.")

        await self.db[self.COLLECTION_NAME].update_one({"_id": object_id}, {"$set": update_data})
        updated = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        updated["_id"] = str(updated["_id"])
        return CategoryResponse(**self._normalize_category_document(updated))

    async def delete_category(self, category_id: str) -> None:
        try:
            object_id = ObjectId(category_id)
        except InvalidId:
            raise ValueError("Invalid category ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Category not found.")

        public_id = existing.get("cloudinary_public_id")
        if public_id:
            await cloudinary_service.delete_image(public_id)

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
