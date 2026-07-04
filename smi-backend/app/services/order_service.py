from datetime import datetime, timezone

from fastapi import BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.order import CheckoutRequest, OrderOut, OrderStatusUpdate
from app.services.cart_service import CartService
from app.services.payment_service import PaymentService
from app.services.email_service import EmailService
from app.utils.errors import BadRequestError, NotFoundError
from app.utils.object_id import stringify_id, validate_object_id


class OrderService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["orders"]
        self.cart = CartService(db)
        self.payments = PaymentService()

    async def create_order(self, user_id: str, payload: CheckoutRequest, background_tasks: BackgroundTasks = None) -> OrderOut:
        cart = await self.cart.get_cart(user_id, payload.deliveryOption)
        if not cart.items:
            raise BadRequestError("Cart is empty")
        if not cart.stockValid:
            raise BadRequestError("; ".join(cart.stockErrors))

        now = datetime.now(timezone.utc)
        document = {
            "userId": user_id,
            "items": [item.model_dump() for item in cart.items],
            "shippingAddress": payload.shippingAddress.model_dump(),
            "subtotal": cart.subtotal,
            "shipping": cart.shipping,
            "tax": cart.tax,
            "total": cart.total,
            "totalQuantity": cart.totalQuantity,
            "deliveryOption": payload.deliveryOption,
            "payment": {"method": payload.paymentMethod, "status": "initializing"},
            "status": "pending",
            "createdAt": now,
            "updatedAt": now,
        }
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        payment = await self.payments.initialize(payload.paymentMethod, cart.total, str(result.inserted_id))
        await self.collection.update_one({"_id": result.inserted_id}, {"$set": {"payment": payment.model_dump()}})
        document["payment"] = payment.model_dump()
        if payload.paymentMethod == "cod":
            await self.cart.clear(user_id)
            
        if background_tasks:
            background_tasks.add_task(
                EmailService.send_new_order_email, 
                order_id=str(result.inserted_id), 
                total=cart.total, 
                user_id=user_id
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
            total=doc["total"],
            totalQuantity=doc["totalQuantity"],
            deliveryOption=doc["deliveryOption"],
            payment=doc["payment"],
            status=doc["status"],
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

