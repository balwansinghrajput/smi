from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.schemas.shipping import DeliveryMethodCreate, DeliveryMethodUpdate


class ShippingService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.delivery_methods

    def _format_method(self, method: dict) -> dict:
        method["_id"] = str(method["_id"])
        return method

    async def list_methods(self):
        cursor = self.collection.find().sort("slot", 1)
        methods = await cursor.to_list(length=100)
        return [self._format_method(m) for m in methods]

    async def get_active_methods(self):
        cursor = self.collection.find({"is_active": True}).sort("slot", 1)
        methods = await cursor.to_list(length=100)
        return [self._format_method(m) for m in methods]

    async def create_method(self, payload: DeliveryMethodCreate):
        total_methods = await self.collection.count_documents({})
        if total_methods >= 2:
            raise HTTPException(status_code=400, detail="Maximum of two delivery methods can be created.")

        # Determine slot (1 or 2)
        existing = await self.list_methods()
        used_slots = [m.get("slot") for m in existing]
        slot = 1 if 1 not in used_slots else 2

        doc = payload.model_dump()
        doc["slot"] = slot

        result = await self.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    async def update_method(self, method_id: str, payload: DeliveryMethodUpdate):
        update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields provided for update")

        result = await self.collection.update_one(
            {"_id": ObjectId(method_id)}, {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Delivery method not found")

        updated_doc = await self.collection.find_one({"_id": ObjectId(method_id)})
        return self._format_method(updated_doc)

    async def delete_method(self, method_id: str):
        result = await self.collection.delete_one({"_id": ObjectId(method_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Delivery method not found")
        return True

    async def toggle_method(self, method_id: str):
        method = await self.collection.find_one({"_id": ObjectId(method_id)})
        if not method:
            raise HTTPException(status_code=404, detail="Delivery method not found")

        new_status = not method.get("is_active", True)
        await self.collection.update_one(
            {"_id": ObjectId(method_id)}, {"$set": {"is_active": new_status}}
        )
        
        updated_doc = await self.collection.find_one({"_id": ObjectId(method_id)})
        return self._format_method(updated_doc)
