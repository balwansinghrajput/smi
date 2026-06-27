from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.utils.object_id import stringify_id, validate_object_id


class UserRepository:
    collection_name = "users"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[self.collection_name]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index("email", unique=True)

    async def create(self, data: dict) -> dict:
        now = datetime.now(timezone.utc)
        document = {**data, "createdAt": now, "updatedAt": now}
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return stringify_id(document)

    async def get_by_email(self, email: str) -> dict | None:
        return stringify_id(await self.collection.find_one({"email": email.lower()}))

    async def get_by_id(self, user_id: str) -> dict | None:
        object_id = validate_object_id(user_id, "user id")
        return stringify_id(await self.collection.find_one({"_id": object_id}))

    async def update(self, user_id: str, data: dict) -> dict | None:
        object_id = validate_object_id(user_id, "user id")
        update = {**data, "updatedAt": datetime.now(timezone.utc)}
        await self.collection.update_one({"_id": object_id}, {"$set": update})
        return stringify_id(await self.collection.find_one({"_id": object_id}))

