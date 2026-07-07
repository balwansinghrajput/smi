from datetime import datetime, timezone
from typing import Any, Dict

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.coupon import CouponCreateRequest, CouponUpdateRequest, CouponResponse, PaginatedCoupons


class CouponService:
    COLLECTION_NAME = "coupons"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Fill in any missing optional fields with safe defaults."""
        if document is None:
            return document
        document.setdefault("min_order_amount", 0)
        document.setdefault("usage_count", 0)
        document.setdefault("max_discount", None)
        document.setdefault("max_uses", None)
        document.setdefault("max_uses_per_user", None)
        document.setdefault("valid_from", None)
        document.setdefault("valid_until", None)
        document.setdefault("is_active", True)
        return document

    async def create_coupon(self, payload: CouponCreateRequest) -> CouponResponse:
        # Normalise code to uppercase
        code = payload.code.strip().upper()

        existing = await self.db[self.COLLECTION_NAME].find_one({"code": code})
        if existing:
            raise ValueError("Coupon code already exists")

        document = payload.dict()
        document["code"] = code
        document["usage_count"] = 0

        result = await self.db[self.COLLECTION_NAME].insert_one(document)
        document["_id"] = str(result.inserted_id)
        return CouponResponse(**self._normalize(document))

    async def list_coupons(self, page: int = 1, page_size: int = 50) -> PaginatedCoupons:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_coupons = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_coupons + page_size - 1) // page_size, 1)

        cursor = self.db[self.COLLECTION_NAME].find().sort("_id", -1).skip(skip).limit(page_size)
        coupons = []
        async for coupon in cursor:
            coupon["_id"] = str(coupon["_id"])
            coupons.append(CouponResponse(**self._normalize(coupon)))

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
        return CouponResponse(**self._normalize(coupon))

    async def update_coupon(self, coupon_id: str, payload: CouponUpdateRequest) -> CouponResponse:
        try:
            object_id = ObjectId(coupon_id)
        except InvalidId:
            raise ValueError("Invalid coupon ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Coupon not found.")

        # Build update dict — include only explicitly provided fields (even falsy ones like is_active=False)
        update_data = payload.dict(exclude_unset=True)

        if "code" in update_data:
            update_data["code"] = update_data["code"].strip().upper()
            if update_data["code"] != existing.get("code"):
                code_exists = await self.db[self.COLLECTION_NAME].find_one({"code": update_data["code"]})
                if code_exists:
                    raise ValueError("Coupon code already exists")

        if not update_data:
            raise ValueError("No update fields were provided.")

        await self.db[self.COLLECTION_NAME].update_one({"_id": object_id}, {"$set": update_data})
        updated = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        updated["_id"] = str(updated["_id"])
        return CouponResponse(**self._normalize(updated))

    async def toggle_coupon(self, coupon_id: str) -> CouponResponse:
        """Flip is_active status."""
        try:
            object_id = ObjectId(coupon_id)
        except InvalidId:
            raise ValueError("Invalid coupon ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Coupon not found.")

        new_status = not existing.get("is_active", True)
        await self.db[self.COLLECTION_NAME].update_one(
            {"_id": object_id}, {"$set": {"is_active": new_status}}
        )
        existing["is_active"] = new_status
        existing["_id"] = str(existing["_id"])
        return CouponResponse(**self._normalize(existing))

    async def delete_coupon(self, coupon_id: str) -> None:
        try:
            object_id = ObjectId(coupon_id)
        except InvalidId:
            raise ValueError("Invalid coupon ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Coupon not found.")

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})

    async def get_coupon_analytics(self, coupon_id: str) -> dict:
        try:
            object_id = ObjectId(coupon_id)
        except InvalidId:
            raise ValueError("Invalid coupon ID format.")

        coupon = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not coupon:
            raise LookupError("Coupon not found.")

        pipeline = [
            {"$match": {"couponCode": coupon["code"], "status": {"$ne": "cancelled"}}},
            {"$group": {"_id": "$userId", "usage_count": {"$sum": 1}}},
            {
                "$lookup": {
                    "from": "users",
                    "let": {"user_id_str": "$_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": [{"$toString": "$_id"}, "$$user_id_str"]}}}
                    ],
                    "as": "user_info"
                }
            },
            {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "user_id": "$_id",
                    "name": {"$ifNull": ["$user_info.name", "Unknown"]},
                    "email": {"$ifNull": ["$user_info.email", "Unknown"]},
                    "usage_count": 1,
                    "_id": 0
                }
            },
            {"$sort": {"usage_count": -1}}
        ]

        cursor = self.db["orders"].aggregate(pipeline)
        redemptions = await cursor.to_list(length=None)

        total_redemptions = coupon.get("usage_count", 0)
        remaining_usages = None
        if coupon.get("max_uses") is not None:
            remaining_usages = max(0, coupon["max_uses"] - total_redemptions)

        return {
            "total_redemptions": total_redemptions,
            "remaining_usages": remaining_usages,
            "redemptions_by_user": redemptions
        }
