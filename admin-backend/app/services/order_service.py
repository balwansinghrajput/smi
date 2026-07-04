from typing import Any, Dict, Optional

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.order import OrderCreateRequest, OrderStatusUpdateRequest, OrderResponse, PaginatedOrders


class OrderService:
    COLLECTION_NAME = "orders"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize_order_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return document
        return document

    async def create_order(self, payload: OrderCreateRequest) -> OrderResponse:
        document = payload.dict()
        document["status"] = "pending"
        document["payment_status"] = "pending"
        
        result = await self.db[self.COLLECTION_NAME].insert_one(document)
        document["_id"] = str(result.inserted_id)
        return OrderResponse(**self._normalize_order_document(document))

    async def get_product_revenue(self) -> list:
        pipeline = [
            {"$match": {"payment.status": "paid"}},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": {"$toObjectId": "$items.productId"},
                    "units_sold": {"$sum": "$items.quantity"},
                    "revenue": {"$sum": "$items.lineTotal"}
                }
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "_id",
                    "foreignField": "_id",
                    "as": "product_details"
                }
            },
            {"$unwind": "$product_details"},
            {
                "$project": {
                    "product_id": {"$toString": "$_id"},
                    "product_title": "$product_details.product_title",
                    "category": "$product_details.category",
                    "image_url": "$product_details.image_url",
                    "status": "$product_details.status",
                    "price": "$product_details.price",
                    "units_sold": 1,
                    "revenue": 1,
                    "_id": 0
                }
            },
            {"$sort": {"revenue": -1}}
        ]
        
        cursor = self.db[self.COLLECTION_NAME].aggregate(pipeline)
        results = await cursor.to_list(length=None)
        return results

    async def list_orders(self, page: int = 1, page_size: int = 20) -> PaginatedOrders:
        page = max(page, 1)
        skip = (page - 1) * page_size

        total_orders = await self.db[self.COLLECTION_NAME].count_documents({})
        total_pages = max((total_orders + page_size - 1) // page_size, 1)

        cursor = self.db[self.COLLECTION_NAME].find().sort("_id", -1).skip(skip).limit(page_size)
        orders = []
        async for order in cursor:
            order["_id"] = str(order["_id"])
            orders.append(OrderResponse(**self._normalize_order_document(order)))

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_orders": total_orders,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        }
        return PaginatedOrders(orders=orders, pagination=pagination)

    async def get_order(self, order_id: str) -> OrderResponse:
        try:
            object_id = ObjectId(order_id)
        except InvalidId:
            raise ValueError("Invalid order ID format.")

        order = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not order:
            raise LookupError("Order not found.")

        order["_id"] = str(order["_id"])
        return OrderResponse(**self._normalize_order_document(order))

    async def update_order_status(
        self,
        order_id: str,
        payload: OrderStatusUpdateRequest
    ) -> OrderResponse:
        try:
            object_id = ObjectId(order_id)
        except InvalidId:
            raise ValueError("Invalid order ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Order not found.")

        update_data = {}
        if payload.status is not None:
            update_data["status"] = payload.status
        if payload.payment_status is not None:
            update_data["payment.status"] = payload.payment_status
        if hasattr(payload, "paid_amount") and payload.paid_amount is not None:
            update_data["payment.paidAmount"] = payload.paid_amount

        if not update_data:
            raise ValueError("No update fields were provided.")

        await self.db[self.COLLECTION_NAME].update_one({"_id": object_id}, {"$set": update_data})
        updated = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        updated["_id"] = str(updated["_id"])
        return OrderResponse(**self._normalize_order_document(updated))

    async def delete_order(self, order_id: str) -> None:
        try:
            object_id = ObjectId(order_id)
        except InvalidId:
            raise ValueError("Invalid order ID format.")

        existing = await self.db[self.COLLECTION_NAME].find_one({"_id": object_id})
        if not existing:
            raise LookupError("Order not found.")

        await self.db[self.COLLECTION_NAME].delete_one({"_id": object_id})
