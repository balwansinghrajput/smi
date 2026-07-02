from typing import Any, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.dashboard import DashboardSummaryResponse

class DashboardService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_summary(self) -> DashboardSummaryResponse:
        total_users = await self.db["users"].count_documents({})
        total_orders = await self.db["orders"].count_documents({})
        total_products = await self.db["products"].count_documents({})

        # Calculate total revenue from paid or delivered orders
        revenue_pipeline = [
            {"$match": {"status": {"$in": ["delivered", "shipped", "processing", "confirmed"]}, "payment.status": "paid"}},
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        revenue_cursor = self.db["orders"].aggregate(revenue_pipeline)
        revenue_result = await revenue_cursor.to_list(length=1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0.0

        # Fetch 5 recent orders
        recent_orders_cursor = self.db["orders"].find().sort("_id", -1).limit(5)
        recent_orders = []
        async for order in recent_orders_cursor:
            order["_id"] = str(order["_id"])
            recent_orders.append(order)

        return DashboardSummaryResponse(
            total_users=total_users,
            total_orders=total_orders,
            total_products=total_products,
            total_revenue=total_revenue,
            recent_orders=recent_orders,
        )
