from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.product import ProductCreateRequest, ProductUpdateRequest, ProductResponse, PaginatedProducts
from app.services.cloudinary import cloudinary_service


class ProductService:
    COLLECTION_NAME = "products"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize_product_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return document

        if "cloudinary_public_id" not in document:
            document["cloudinary_public_id"] = document.get(
                "image_public_id",
                cloudinary_service.get_public_id_from_url(document.get("image_url", "")) or "",
            )

        if "tags" not in document or document["tags"] is None:
            document["tags"] = []

        if "has_shipping" not in document:
            document["has_shipping"] = True

        return document

    async def create_product(self, payload: ProductCreateRequest, image: Any) -> ProductResponse:
        upload_result = await cloudinary_service.upload_image(image)
        tags = payload.tags or []

        document = {
            "product_title": payload.product_title,
            "sub_title": payload.sub_title,
            "category": payload.category,
            "product_description": payload.product_description,
            "image_url": upload_result["secure_url"],
            "cloudinary_public_id": upload_result["public_id"],
            "price": payload.price,
            "stock": payload.stock,
            "status": payload.status.value,
            "tags": tags,
            "has_shipping": payload.has_shipping,
        }

        result = await self.db[self.COLLECTION_NAME].insert_one(document)
        document["_id"] = str(result.inserted_id)
        return ProductResponse(**self._normalize_product_document(document))

    async def list_products(self, page: int = 1, page_size: int = 10) -> PaginatedProducts:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_products = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_products + page_size - 1) // page_size, 1)

        cursor = self.db[self.COLLECTION_NAME].find().skip(skip).limit(page_size)
        products = []
        async for product in cursor:
            product["_id"] = str(product["_id"])
            products.append(ProductResponse(**self._normalize_product_document(product)))

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_products": total_products,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        }
        return PaginatedProducts(products=products, pagination=pagination)

    async def get_product(self, product_id: str) -> ProductResponse:
        try:
            object_id = ObjectId(product_id)
        except InvalidId:
            raise ValueError("Invalid product ID format.")

        product = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not product:
            raise LookupError("Product not found.")

        product["_id"] = str(product["_id"])
        return ProductResponse(**self._normalize_product_document(product))

    async def update_product(
        self,
        product_id: str,
        payload: ProductUpdateRequest,
        image: Optional[Any] = None,
    ) -> ProductResponse:
        try:
            object_id = ObjectId(product_id)
        except InvalidId:
            raise ValueError("Invalid product ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Product not found.")

        update_data = {}
        if payload.product_title is not None:
            update_data["product_title"] = payload.product_title
        if payload.sub_title is not None:
            update_data["sub_title"] = payload.sub_title
        if payload.category is not None:
            update_data["category"] = payload.category
        if payload.product_description is not None:
            update_data["product_description"] = payload.product_description
        if payload.price is not None:
            update_data["price"] = payload.price
        if payload.stock is not None:
            update_data["stock"] = payload.stock
        if payload.status is not None:
            update_data["status"] = payload.status.value
        if payload.has_shipping is not None:
            update_data["has_shipping"] = payload.has_shipping
        if payload.tags is not None:
            update_data["tags"] = payload.tags

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
        return ProductResponse(**self._normalize_product_document(updated))

    async def delete_product(self, product_id: str) -> None:
        try:
            object_id = ObjectId(product_id)
        except InvalidId:
            raise ValueError("Invalid product ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Product not found.")

        public_id = existing.get("cloudinary_public_id")
        if public_id:
            await cloudinary_service.delete_image(public_id)

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
