from fastapi import APIRouter

from .health_routes import router as health_router
from .product_routes import router as product_router
from .admin_routes import router as admin_router

router = APIRouter()
router.include_router(health_router)
router.include_router(product_router)
router.include_router(admin_router)

__all__ = ["router", "product_router", "health_router", "admin_router"]
