from datetime import datetime, timezone
from typing import Optional

from fastapi import BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.order import CheckoutRequest, OrderOut, OrderStatusUpdate
from app.services.cart_service import CartService
from app.services.payment_service import PaymentService
from app.services.email_service import EmailService
from app.utils.errors import BadRequestError, NotFoundError
from app.utils.object_id import stringify_id, validate_object_id
from bson import ObjectId


class OrderService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["orders"]
        self.cart = CartService(db)
        self.payments = PaymentService()

    async def _apply_coupon(self, code: str, user_id: str, subtotal: float) -> tuple[float, str]:
        """
        Re-validate and apply a coupon at order-time (safety check against race conditions).
        Returns (discount_amount, normalised_code) or raises BadRequestError.
        """
        code = code.strip().upper()
        coupon = await self.db["coupons"].find_one({"code": code})

        if not coupon:
            raise BadRequestError("Coupon code is invalid")
        if not coupon.get("is_active", True):
            raise BadRequestError("Coupon is no longer active")

        now = datetime.now(timezone.utc)
        valid_from = coupon.get("valid_from")
        valid_until = coupon.get("valid_until")
        if valid_from and valid_from.tzinfo is None:
            valid_from = valid_from.replace(tzinfo=timezone.utc)
        if valid_until and valid_until.tzinfo is None:
            valid_until = valid_until.replace(tzinfo=timezone.utc)
        if valid_from and now < valid_from:
            raise BadRequestError("Coupon is not yet valid")
        if valid_until and now > valid_until:
            raise BadRequestError("Coupon has expired")

        max_uses = coupon.get("max_uses")
        if max_uses is not None and coupon.get("usage_count", 0) >= max_uses:
            raise BadRequestError("Coupon has reached its usage limit")

        min_order = coupon.get("min_order_amount", 0) or 0
        if subtotal < min_order:
            raise BadRequestError(f"Minimum order of ₹{min_order:.0f} required for this coupon")

        max_uses_per_user = coupon.get("max_uses_per_user")
        if max_uses_per_user is not None:
            user_uses = await self.collection.count_documents(
                {"userId": user_id, "couponCode": code, "status": {"$ne": "cancelled"}}
            )
            if user_uses >= max_uses_per_user:
                raise BadRequestError("You have already used this coupon the maximum number of times")

        discount_type = coupon.get("discount_type", "fixed")
        discount_value = coupon.get("discount_value", 0)
        max_discount = coupon.get("max_discount")

        if discount_type == "percentage":
            discount_amount = round(subtotal * discount_value / 100, 2)
            if max_discount is not None:
                discount_amount = min(discount_amount, max_discount)
        else:
            discount_amount = min(discount_value, subtotal)

        return discount_amount, code

    async def create_order(
        self,
        user_id: str,
        user_email: str,
        payload: CheckoutRequest,
        background_tasks: BackgroundTasks = None,
    ) -> OrderOut:
        cart = await self.cart.get_cart(user_id, payload.deliveryMethodId)
        if not cart.items:
            raise BadRequestError("Cart is empty")
        if not cart.stockValid:
            raise BadRequestError("; ".join(cart.stockErrors))

        # ── Delivery Method Validation ─────────────────────────────────────────
        try:
            method_oid = ObjectId(payload.deliveryMethodId)
        except Exception:
            raise BadRequestError("Invalid delivery method ID")
            
        method = await self.db["delivery_methods"].find_one({"_id": method_oid})
        if not method or not method.get("is_active", True):
            raise BadRequestError("Invalid or inactive delivery method selected")
        delivery_method_name = method.get("name", "Delivery")

        # ── Coupon discount ────────────────────────────────────────────────────
        discount = 0.0
        coupon_code: Optional[str] = None
        if payload.couponCode and payload.couponCode.strip():
            discount, coupon_code = await self._apply_coupon(
                payload.couponCode, user_id, cart.subtotal
            )

        # Recalculate tax on discounted subtotal
        from app.config.settings import settings
        discounted_subtotal = max(cart.subtotal - discount, 0)
        tax = round(discounted_subtotal * settings.TAX_RATE)
        total = discounted_subtotal + cart.shipping + tax

        now = datetime.now(timezone.utc)
        document = {
            "userId": user_id,
            "items": [item.model_dump() for item in cart.items],
            "shippingAddress": payload.shippingAddress.model_dump(),
            "subtotal": cart.subtotal,
            "shipping": cart.shipping,
            "tax": tax,
            "discount": discount,
            "total": total,
            "totalQuantity": cart.totalQuantity,
            "deliveryMethodId": payload.deliveryMethodId,
            "deliveryMethodName": delivery_method_name,
            "payment": {"method": payload.paymentMethod, "status": "initializing"},
            "status": "pending",
            "couponCode": coupon_code,
            "createdAt": now,
            "updatedAt": now,
        }
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id

        # Initialise payment
        payment = await self.payments.initialize(payload.paymentMethod, total, str(result.inserted_id))
        await self.collection.update_one({"_id": result.inserted_id}, {"$set": {"payment": payment.model_dump()}})
        document["payment"] = payment.model_dump()

        if payload.paymentMethod == "cod":
            await self.cart.clear(user_id)

        # Increment coupon usage count
        if coupon_code:
            await self.db["coupons"].update_one(
                {"code": coupon_code}, {"$inc": {"usage_count": 1}}
            )

        if background_tasks:
            background_tasks.add_task(
                EmailService.send_new_order_email,
                order_id=str(result.inserted_id),
                total=total,
                user_id=user_id,
            )
            background_tasks.add_task(
                EmailService.send_order_confirmation_email,
                user_email=user_email,
                order_details=document,
            )

        return self.normalize(stringify_id(document))

    def normalize(self, doc: dict) -> OrderOut:
        return OrderOut(
            id=doc["id"],
            userId=doc["userId"],
            items=doc["items"],
            shippingAddress=doc["shippingAddress"],
            subtotal=doc["subtotal"],
            shipping=doc["shipping"],
            tax=doc["tax"],
            discount=doc.get("discount", 0.0),
            total=doc["total"],
            totalQuantity=doc["totalQuantity"],
            deliveryMethodId=doc.get("deliveryMethodId", ""),
            deliveryMethodName=doc.get("deliveryMethodName", doc.get("deliveryOption", "Standard Delivery")),
            payment=doc["payment"],
            status=doc["status"],
            couponCode=doc.get("couponCode"),
            createdAt=doc["createdAt"],
            updatedAt=doc.get("updatedAt"),
        )

    async def list_orders(self, user_id: str) -> list[OrderOut]:
        cursor = self.collection.find({"userId": user_id}).sort("createdAt", -1)
        return [self.normalize(stringify_id(doc)) async for doc in cursor]

    async def get(self, user_id: str, order_id: str) -> OrderOut:
        object_id = validate_object_id(order_id, "order id")
        doc = await self.collection.find_one({"_id": object_id, "userId": user_id})
        if not doc:
            raise NotFoundError("Order not found")
        return self.normalize(stringify_id(doc))

    async def cancel(self, user_id: str, order_id: str) -> OrderOut:
        object_id = validate_object_id(order_id, "order id")
        doc = await self.collection.find_one({"_id": object_id, "userId": user_id})
        if not doc:
            raise NotFoundError("Order not found")
        if doc.get("status") in {"shipped", "delivered", "cancelled"}:
            raise BadRequestError("This order cannot be cancelled")
        await self.collection.update_one(
            {"_id": object_id},
            {"$set": {"status": "cancelled", "updatedAt": datetime.now(timezone.utc)}},
        )
        return await self.get(user_id, order_id)

    async def status(self, user_id: str, order_id: str, payload: OrderStatusUpdate) -> OrderOut:
        object_id = validate_object_id(order_id, "order id")
        await self.collection.update_one(
            {"_id": object_id, "userId": user_id},
            {"$set": {"status": payload.status, "updatedAt": datetime.now(timezone.utc)}},
        )
        return await self.get(user_id, order_id)
