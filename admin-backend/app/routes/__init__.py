from fastapi import APIRouter

from .health_routes import router as health_router
from .product_routes import router as product_router
from .admin_routes import router as admin_router
from .category_routes import router as category_router
from .brand_routes import router as brand_router
from .order_routes import router as order_router
from .user_routes import router as user_router
from .review_routes import router as review_router
from .coupon_routes import router as coupon_router
from .setting_routes import router as setting_router
from .dashboard_routes import router as dashboard_router
from .shipping_routes import router as shipping_router

router = APIRouter()
router.include_router(health_router)
router.include_router(product_router)
router.include_router(admin_router)
router.include_router(category_router)
router.include_router(brand_router)
router.include_router(order_router)
router.include_router(user_router)
router.include_router(review_router)
router.include_router(coupon_router)
router.include_router(setting_router)
router.include_router(dashboard_router)
router.include_router(shipping_router)

__all__ = ["router", "product_router", "health_router", "admin_router", "category_router", "brand_router", "order_router", "user_router", "review_router", "coupon_router", "setting_router", "dashboard_router", "shipping_router"]
