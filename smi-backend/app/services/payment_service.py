import razorpay

from app.config.settings import settings
from app.schemas.order import PaymentInfo


class PaymentService:
    """
    Handles payment initialization and verification via Razorpay.

    To switch to live payments, simply update RAZORPAY_KEY_ID and
    RAZORPAY_KEY_SECRET in your .env file — no code changes needed.
    """

    def __init__(self):
        self._client: razorpay.Client | None = None

    @property
    def client(self) -> razorpay.Client:
        """Lazily initialize Razorpay client so missing keys fail at call time."""
        if self._client is None:
            self._client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
        return self._client

    async def initialize(self, method: str, amount: float, order_id: str) -> PaymentInfo:
        """
        Initialize payment for a given method.

        Args:
            method: "cod", "online", "upi", or "card"
            amount: total order amount in INR
            order_id: our internal order ID (MongoDB ObjectId as string)

        Returns:
            PaymentInfo with method, status, provider, transactionId, paymentUrl
        """
        if method == "cod":
            return PaymentInfo(
                method="cod",
                status="pending",
                provider="cash_on_delivery",
            )

        # All online payment methods (online/upi/card) use Razorpay
        # Amount must be in paise (INR × 100)
        amount_paise = int(round(amount * 100))

        razorpay_order = self.client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": order_id,
            "notes": {
                "order_id": order_id,
                "payment_method": method,
            },
            "payment_capture": 1,  # auto-capture after success
        })

        return PaymentInfo(
            method=method,
            status="created",
            provider="razorpay",
            transactionId=razorpay_order["id"],   # razorpay_order_id
            paymentUrl=None,                        # handled client-side via JS SDK
        )

    def verify_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:
        """
        Verify Razorpay payment signature using HMAC-SHA256.

        This is the security-critical step — never skip this in production.
        """
        try:
            self.client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            })
            return True
        except Exception:
            return False
