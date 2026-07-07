from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.utils.errors import BadRequestError

router = APIRouter(prefix="/coupons", tags=["Coupons"])


class CouponValidateRequest(BaseModel):
    code: str
    subtotal: float


class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_type: str
    discount_value: float
    max_discount: Optional[float] = None
    discount_amount: float
    message: str


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    payload: CouponValidateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Validate a coupon code against the current user's cart subtotal.
    Performs all checks: existence, active status, expiry, usage limits,
    per-user limits, and minimum order amount.
    """
    code = payload.code.strip().upper()
    subtotal = payload.subtotal

    # ── 1. Fetch coupon ───────────────────────────────────────────────────────
    coupon = await db["coupons"].find_one({"code": code})
    if not coupon:
        raise BadRequestError("Coupon code not found")

    # ── 2. Active check ───────────────────────────────────────────────────────
    if not coupon.get("is_active", True):
        raise BadRequestError("This coupon is no longer active")

    # ── 3. Expiry check ───────────────────────────────────────────────────────
    now = datetime.now(timezone.utc)
    valid_from = coupon.get("valid_from")
    valid_until = coupon.get("valid_until")

    if valid_from and valid_from.tzinfo is None:
        valid_from = valid_from.replace(tzinfo=timezone.utc)
    if valid_until and valid_until.tzinfo is None:
        valid_until = valid_until.replace(tzinfo=timezone.utc)

    if valid_from and now < valid_from:
        raise BadRequestError("This coupon is not yet valid")
    if valid_until and now > valid_until:
        raise BadRequestError("This coupon has expired")

    # ── 4. Global usage limit ─────────────────────────────────────────────────
    max_uses = coupon.get("max_uses")
    if max_uses is not None:
        usage_count = coupon.get("usage_count", 0)
        if usage_count >= max_uses:
            raise BadRequestError("This coupon has reached its usage limit")

    # ── 5. Minimum order amount ───────────────────────────────────────────────
    min_order = coupon.get("min_order_amount", 0) or 0
    if subtotal < min_order:
        raise BadRequestError(
            f"Minimum order amount of ₹{min_order:.0f} required for this coupon"
        )

    # ── 6. Per-user usage limit ───────────────────────────────────────────────
    max_uses_per_user = coupon.get("max_uses_per_user")
    if max_uses_per_user is not None:
        user_usage = await db["orders"].count_documents(
            {"userId": current_user["id"], "couponCode": code, "status": {"$ne": "cancelled"}}
        )
        if user_usage >= max_uses_per_user:
            raise BadRequestError("You have already used this coupon the maximum number of times")

    # ── 7. Calculate discount amount ──────────────────────────────────────────
    discount_type = coupon.get("discount_type", "fixed")
    discount_value = coupon.get("discount_value", 0)
    max_discount = coupon.get("max_discount")

    if discount_type == "percentage":
        discount_amount = round(subtotal * discount_value / 100, 2)
        if max_discount is not None:
            discount_amount = min(discount_amount, max_discount)
    else:
        discount_amount = min(discount_value, subtotal)

    return CouponValidateResponse(
        valid=True,
        code=code,
        discount_type=discount_type,
        discount_value=discount_value,
        max_discount=max_discount,
        discount_amount=discount_amount,
        message=f"Coupon applied! You save ₹{discount_amount:.2f}",
    )
