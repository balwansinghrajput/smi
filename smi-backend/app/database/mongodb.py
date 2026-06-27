import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import settings

logger = logging.getLogger(__name__)


class MongoManager:
    def __init__(self) -> None:
        self.client: AsyncIOMotorClient | None = None
        self.db: AsyncIOMotorDatabase | None = None

    def connect(self) -> None:
        logger.info("Connecting to MongoDB")
        self.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            uuidRepresentation="standard",
        )
        self.db = self.client[settings.DATABASE_NAME]

    async def ping(self) -> bool:
        if self.db is None:
            return False
        result = await self.db.command("ping")
        return result.get("ok") == 1

    def close(self) -> None:
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")


mongo = MongoManager()


async def get_database() -> AsyncIOMotorDatabase:
    if mongo.db is None:
        raise RuntimeError("MongoDB is not initialized")
    return mongo.db

