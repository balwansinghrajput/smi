import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Only configure if SMTP server is provided
conf = None
if settings.MAIL_SERVER and settings.MAIL_USERNAME:
    conf = ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )

class EmailService:
    @staticmethod
    async def send_new_order_email(order_id: str, total: float, user_id: str):
        if not conf or not settings.ADMIN_EMAIL:
            logger.warning("Email configuration missing. Skipping new order email.")
            return

        html = f"""
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4f46e5;">New Order Received!</h2>
            <p>A new order has been placed on the store.</p>
            <table style="width: 100%; max-width: 500px; border-collapse: collapse; margin-top: 15px;">
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Order ID:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace;">{order_id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${total:.2f}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Customer ID:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace;">{user_id}</td>
                </tr>
            </table>
            <br>
            <a href="http://localhost:5173/orders" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">View in Admin Panel</a>
        </div>
        """

        message = MessageSchema(
            subject=f"New Order: #{order_id[-8:]}",
            recipients=[settings.ADMIN_EMAIL],
            body=html,
            subtype=MessageType.html
        )

        try:
            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info(f"Successfully sent new order email to {settings.ADMIN_EMAIL}")
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
