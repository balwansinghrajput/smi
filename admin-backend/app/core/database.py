import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoManager:
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db: AsyncIOMotorDatabase = None

    def connect_to_mongo(self):
        logger.info("Connecting to MongoDB...")
        self.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            uuidRepresentation="standard"
        )
        self.db = self.client[settings.DATABASE_NAME]
        logger.info("MongoDB connection pool established successfully.")

    async def ping(self) -> bool:
        if self.db is None:
            return False
        try:
            result = await self.db.command("ping")
            return result.get("ok") == 1
        except Exception:
            logger.exception("MongoDB ping failed.")
            return False

    def close_mongo_connection(self):
        if self.client:
            logger.info("Closing MongoDB connection...")
            self.client.close()
            logger.info("MongoDB connection closed.")

# Instantiate a single manager instance across the application lifecycle
db_manager = MongoManager()

# FastAPI Dependency to fetch database instances inside routes
async def get_database() -> AsyncIOMotorDatabase:
    if db_manager.db is None:
        raise RuntimeError("MongoDB is not initialized")
    return db_manager.db