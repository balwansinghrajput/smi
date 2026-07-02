from typing import Any, Dict

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.coupon import CouponCreateRequest, CouponUpdateRequest, CouponResponse, PaginatedCoupons


class CouponService:
    COLLECTION_NAME = "coupons"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize_coupon_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return document
        return document

    async def create_coupon(self, payload: CouponCreateRequest) -> CouponResponse:
        document = payload.dict()
        
        # Check if code already exists
        existing = await self.db[self.COLLECTION_NAME].find_one({"code": payload.code})
        if existing:
            raise ValueError("Coupon code already exists")
            
        result = await self.db[self.COLLECTION_NAME].insert_one(document)
        document["_id"] = str(result.inserted_id)
        return CouponResponse(**self._normalize_coupon_document(document))

    async def list_coupons(self, page: int = 1, page_size: int = 50) -> PaginatedCoupons:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_coupons = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_coupons + page_size - 1) // page_size, 1)

        cursor = self.db[self.COLLECTION_NAME].find().skip(skip).limit(page_size)
        coupons = []
        async for coupon in cursor:
            coupon["_id"] = str(coupon["_id"])
            coupons.append(CouponResponse(**self._normalize_coupon_document(coupon)))

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_coupons": total_coupons,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        }
        return PaginatedCoupons(coupons=coupons, pagination=pagination)

    async def get_coupon(self, coupon_id: str) -> CouponResponse:
        try:
            object_id = ObjectId(coupon_id)
        except InvalidId:
            raise ValueError("Invalid coupon ID format.")

        coupon = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not coupon:
            raise LookupError("Coupon not found.")

        coupon["_id"] = str(coupon["_id"])
        return CouponResponse(**self._normalize_coupon_document(coupon))

    async def update_coupon(
        self,
        coupon_id: str,
        payload: CouponUpdateRequest
    ) -> CouponResponse:
        try:
            object_id = ObjectId(coupon_id)
        except InvalidId:
            raise ValueError("Invalid coupon ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Coupon not found.")

        update_data = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
        
        if "code" in update_data and update_data["code"] != existing["code"]:
            code_exists = await self.db[self.COLLECTION_NAME].find_one({"code": update_data["code"]})
            if code_exists:
                raise ValueError("Coupon code already exists")

        if not update_data:
            raise ValueError("No update fields were provided.")

        await self.db[self.COLLECTION_NAME].update_one({"_id": object_id}, {"$set": update_data})
        updated = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        updated["_id"] = str(updated["_id"])
        return CouponResponse(**self._normalize_coupon_document(updated))

    async def delete_coupon(self, coupon_id: str) -> None:
        try:
            object_id = ObjectId(coupon_id)
        except InvalidId:
            raise ValueError("Invalid coupon ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Coupon not found.")

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
