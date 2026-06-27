import re
from math import ceil
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductOut, ProductPage
from app.utils.errors import NotFoundError

PAGE_SIZE = 4


def _slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


class ProductService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repository = ProductRepository(db)

    def normalize(self, doc: dict[str, Any]) -> ProductOut:
        title = doc.get("product_title") or doc.get("name") or "Product"
        category = doc.get("category") or doc.get("categoryId") or "General"
        stock = int(doc.get("stock", doc.get("stockCount", 0)) or 0)
        tags = doc.get("tags") or doc.get("keywords") or []
        image = doc.get("image_url") or doc.get("image") or ""
        images = doc.get("images") or ([image] if image else [])
        price = float(doc.get("price", 0) or 0)
        original_price = doc.get("originalPrice") or doc.get("original_price")
        specifications = doc.get("specifications") or {}
        if doc.get("sub_title"):
            specifications.setdefault("subtitle", doc["sub_title"])
        return ProductOut(
            id=doc["id"],
            name=title,
            slug=doc.get("slug") or _slugify(title),
            categoryId=category,
            category=category,
            brand=doc.get("brand") or doc.get("manufacturer"),
            price=price,
            originalPrice=float(original_price) if original_price is not None else None,
            rating=float(doc.get("rating", 0) or 0),
            reviewCount=int(doc.get("reviewCount", doc.get("review_count", 0)) or 0),
            inStock=stock > 0,
            stockCount=stock,
            isFeatured=bool(doc.get("isFeatured", doc.get("featured", False))),
            isBestSelling=bool(doc.get("isBestSelling", doc.get("best_selling", False))),
            isNew=bool(doc.get("isNew", False)),
            images=images,
            capacity=doc.get("capacity"),
            voltage=doc.get("voltage"),
            warranty=doc.get("warranty"),
            description=doc.get("product_description") or doc.get("description") or "",
            specifications=specifications,
            keywords=tags,
            createdAt=str(doc.get("createdAt") or doc.get("created_at") or ""),
        )

    def page_response(self, docs: list[dict], total: int, page: int) -> ProductPage:
        total_pages = max(ceil(total / PAGE_SIZE), 1)
        return ProductPage(
            products=[self.normalize(doc) for doc in docs],
            currentPage=page,
            totalPages=total_pages,
            totalProducts=total,
            hasNext=page < total_pages,
            hasPrevious=page > 1,
        )

    async def list_products(self, page: int, category: str | None = None, featured: bool | None = None) -> ProductPage:
        filters: dict[str, Any] = {}
        if category:
            pattern = "[ -]".join(re.escape(part) for part in category.split("-"))
            filters["category"] = {"$regex": f"^{pattern}$", "$options": "i"}
        if featured is not None:
            filters["isFeatured"] = featured
        docs, total = await self.repository.list(max(page, 1), PAGE_SIZE, filters)
        return self.page_response(docs, total, max(page, 1))

    async def search(self, q: str, page: int) -> ProductPage:
        docs, total = await self.repository.search(q.strip(), max(page, 1), PAGE_SIZE)
        return self.page_response(docs, total, max(page, 1))

    async def get(self, product_id: str) -> ProductOut:
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")
        return self.normalize(product)

    async def get_raw(self, product_id: str) -> dict:
        product = await self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")
        return product

    async def related(self, product_id: str) -> list[ProductOut]:
        product = await self.get_raw(product_id)
        return [self.normalize(doc) for doc in await self.repository.related(product)]

    async def categories(self) -> list[dict]:
        return await self.repository.categories()
