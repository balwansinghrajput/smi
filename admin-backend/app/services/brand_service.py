from typing import Any, Dict, Optional

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.brand import BrandCreateRequest, BrandUpdateRequest, BrandResponse, PaginatedBrands
from app.services.cloudinary import cloudinary_service


class BrandService:
    COLLECTION_NAME = "brands"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize_brand_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return document
        return document

    async def create_brand(self, payload: BrandCreateRequest, image: Optional[Any] = None) -> BrandResponse:
        document = {
            "name": payload.name,
            "description": payload.description,
            "image_url": None,
            "cloudinary_public_id": None,
        }

        if image:
            upload_result = await cloudinary_service.upload_image(image)
            document["image_url"] = upload_result["secure_url"]
            document["cloudinary_public_id"] = upload_result["public_id"]

        result = await self.db[self.COLLECTION_NAME].insert_one(document)
        document["_id"] = str(result.inserted_id)
        return BrandResponse(**self._normalize_brand_document(document))

    async def list_brands(self, page: int = 1, page_size: int = 100) -> PaginatedBrands:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_brands = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_brands + page_size - 1) // page_size, 1)

        cursor = self.db[self.COLLECTION_NAME].find().skip(skip).limit(page_size)
        brands = []
        async for brand in cursor:
            brand["_id"] = str(brand["_id"])
            brands.append(BrandResponse(**self._normalize_brand_document(brand)))

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_brands": total_brands,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        }
        return PaginatedBrands(brands=brands, pagination=pagination)

    async def get_brand(self, brand_id: str) -> BrandResponse:
        try:
            object_id = ObjectId(brand_id)
        except InvalidId:
            raise ValueError("Invalid brand ID format.")

        brand = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not brand:
            raise LookupError("Brand not found.")

        brand["_id"] = str(brand["_id"])
        return BrandResponse(**self._normalize_brand_document(brand))

    async def update_brand(
        self,
        brand_id: str,
        payload: BrandUpdateRequest,
        image: Optional[Any] = None,
    ) -> BrandResponse:
        try:
            object_id = ObjectId(brand_id)
        except InvalidId:
            raise ValueError("Invalid brand ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Brand not found.")

        update_data = {}
        if payload.name is not None:
            update_data["name"] = payload.name
        if payload.description is not None:
            update_data["description"] = payload.description

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
        return BrandResponse(**self._normalize_brand_document(updated))

    async def delete_brand(self, brand_id: str) -> None:
        try:
            object_id = ObjectId(brand_id)
        except InvalidId:
            raise ValueError("Invalid brand ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Brand not found.")

        public_id = existing.get("cloudinary_public_id")
        if public_id:
            await cloudinary_service.delete_image(public_id)

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
