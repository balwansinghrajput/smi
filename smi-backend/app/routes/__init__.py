from fastapi import APIRouter

from app.routes.auth_routes import router as auth_router
from app.routes.cart_routes import router as cart_router
from app.routes.category_routes import router as category_router
from app.routes.checkout_routes import router as checkout_router
from app.routes.coupon_routes import router as coupon_router
from app.routes.order_routes import router as order_router
from app.routes.payment_routes import router as payment_router
from app.routes.product_routes import router as product_router
from app.routes.review_routes import router as review_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(product_router, prefix="/api")
api_router.include_router(category_router, prefix="/api")
api_router.include_router(review_router, prefix="/api")
api_router.include_router(cart_router, prefix="/api")
api_router.include_router(checkout_router, prefix="/api")
api_router.include_router(order_router, prefix="/api")
api_router.include_router(payment_router, prefix="/api")
api_router.include_router(coupon_router, prefix="/api")

