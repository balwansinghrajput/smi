from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from app.database.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.services.payment_service import PaymentService
from app.utils.errors import BadRequestError, NotFoundError
from app.utils.object_id import validate_object_id, stringify_id
from datetime import datetime, timezone

router = APIRouter(prefix="/payments", tags=["Payments"])


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str      # Razorpay order ID (our transactionId)
    razorpay_payment_id: str    # Razorpay payment ID (returned after success)
    razorpay_signature: str     # HMAC-SHA256 signature (from Razorpay JS SDK)


class PaymentVerifyResponse(BaseModel):
    success: bool
    order_id: str
    payment_id: str
    message: str


@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(
    payload: PaymentVerifyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Verify a Razorpay payment after the frontend receives the payment callback.

    Flow:
    1. Frontend calls Razorpay JS SDK
    2. Razorpay calls success handler with razorpay_order_id, razorpay_payment_id, razorpay_signature
    3. Frontend sends those three values here
    4. Backend verifies HMAC-SHA256 signature → marks order as paid
    """
    payment_service = PaymentService()

    # Verify HMAC-SHA256 signature
    is_valid = payment_service.verify_signature(
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
    )

    if not is_valid:
        raise BadRequestError("Payment signature verification failed")

    # Find order by razorpay_order_id stored in payment.transactionId
    orders_collection = db["orders"]
    doc = await orders_collection.find_one({
        "payment.transactionId": payload.razorpay_order_id,
        "userId": current_user["id"],
    })

    if not doc:
        raise NotFoundError("Order not found for this payment")

    now = datetime.now(timezone.utc)

    # Update payment status and order status
    await orders_collection.update_one(
        {"_id": doc["_id"]},
        {
            "$set": {
                "payment.status": "paid",
                "payment.paymentId": payload.razorpay_payment_id,
                "status": "confirmed",
                "updatedAt": now,
            }
        },
    )

    # Clear the user's cart after successful online payment
    carts_collection = db["carts"]
    await carts_collection.delete_one({"userId": current_user["id"]})

    return PaymentVerifyResponse(
        success=True,
        order_id=str(doc["_id"]),
        payment_id=payload.razorpay_payment_id,
        message="Payment verified successfully. Order confirmed.",
    )
