from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    total_users: int
    total_orders: int
    total_products: int
    total_revenue: float
    recent_orders: list
