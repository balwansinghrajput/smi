from uuid import uuid4

from app.schemas.order import PaymentInfo


class PaymentService:
    async def initialize(self, method: str, amount: float, order_id: str) -> PaymentInfo:
        if method == "cod":
            return PaymentInfo(method="cod", status="pending", provider="cash_on_delivery")

        provider_method = "upi" if method == "upi" else "card"
        transaction_id = f"pay_{uuid4().hex}"
        return PaymentInfo(
            method=provider_method,
            status="created",
            provider="mock",
            transactionId=transaction_id,
            paymentUrl=f"/mock-payment/{transaction_id}?order={order_id}&amount={amount}",
        )

