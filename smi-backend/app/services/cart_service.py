from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config.settings import settings
from app.schemas.cart import CartAdd, CartItemOut, CartOut, CartUpdate
from app.services.product_service import ProductService
from app.utils.errors import BadRequestError


class CartService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["carts"]
        self.products = ProductService(db)

    async def _cart_doc(self, user_id: str) -> dict:
        doc = await self.collection.find_one({"userId": user_id})
        if not doc:
            doc = {"userId": user_id, "items": [], "createdAt": datetime.now(timezone.utc)}
            await self.collection.insert_one(doc)
        return doc

    async def _save_items(self, user_id: str, items: list[dict]) -> None:
        await self.collection.update_one(
            {"userId": user_id},
            {"$set": {"items": items, "updatedAt": datetime.now(timezone.utc)}},
            upsert=True,
        )

    async def get_cart(self, user_id: str, delivery_option: str = "standard") -> CartOut:
        doc = await self._cart_doc(user_id)
        output: list[CartItemOut] = []
        stock_errors: list[str] = []
        subtotal = 0.0
        total_quantity = 0

        for item in doc.get("items", []):
            try:
                product = await self.products.get(item["productId"])
            except Exception:
                stock_errors.append(f"Product {item['productId']} is unavailable")
                continue
            quantity = int(item.get("quantity", 1))
            if quantity > product.stockCount:
                stock_errors.append(f"{product.name} has only {product.stockCount} in stock")
            line_total = product.price * quantity
            subtotal += line_total
            total_quantity += quantity
            output.append(CartItemOut(id=item["productId"], productId=item["productId"], quantity=quantity, product=product, lineTotal=line_total))

        shipping = 0 if subtotal >= settings.FREE_SHIPPING_THRESHOLD or subtotal == 0 else settings.SHIPPING_FLAT
        if delivery_option == "express" and subtotal > 0:
            shipping += settings.EXPRESS_DELIVERY_AMOUNT
        tax = round(subtotal * settings.TAX_RATE)
        return CartOut(
            items=output,
            subtotal=subtotal,
            shipping=shipping,
            tax=tax,
            total=subtotal + shipping + tax,
            totalQuantity=total_quantity,
            stockValid=not stock_errors,
            stockErrors=stock_errors,
        )

    async def add(self, user_id: str, payload: CartAdd) -> CartOut:
        product = await self.products.get(payload.productId)
        if not product.inStock:
            raise BadRequestError("Product is out of stock")
        doc = await self._cart_doc(user_id)
        items = doc.get("items", [])
        existing = next((item for item in items if item["productId"] == payload.productId), None)
        new_quantity = payload.quantity + (existing.get("quantity", 0) if existing else 0)
        if new_quantity > product.stockCount:
            raise BadRequestError("Requested quantity exceeds available stock")
        if existing:
            existing["quantity"] = new_quantity
        else:
            items.append({"productId": payload.productId, "quantity": payload.quantity})
        await self._save_items(user_id, items)
        return await self.get_cart(user_id)

    async def update(self, user_id: str, payload: CartUpdate) -> CartOut:
        product = await self.products.get(payload.productId)
        if payload.quantity > product.stockCount:
            raise BadRequestError("Requested quantity exceeds available stock")
        doc = await self._cart_doc(user_id)
        items = doc.get("items", [])
        existing = next((item for item in items if item["productId"] == payload.productId), None)
        if not existing:
            raise BadRequestError("Product is not in your cart")
        existing["quantity"] = payload.quantity
        await self._save_items(user_id, items)
        return await self.get_cart(user_id)

    async def change(self, user_id: str, product_id: str, delta: int) -> CartOut:
        doc = await self._cart_doc(user_id)
        existing = next((item for item in doc.get("items", []) if item["productId"] == product_id), None)
        if not existing:
            raise BadRequestError("Product is not in your cart")
        return await self.update(user_id, CartUpdate(productId=product_id, quantity=max(1, existing["quantity"] + delta)))

    async def remove(self, user_id: str, product_id: str) -> CartOut:
        doc = await self._cart_doc(user_id)
        items = [item for item in doc.get("items", []) if item["productId"] != product_id]
        await self._save_items(user_id, items)
        return await self.get_cart(user_id)

    async def clear(self, user_id: str) -> CartOut:
        await self._save_items(user_id, [])
        return await self.get_cart(user_id)

