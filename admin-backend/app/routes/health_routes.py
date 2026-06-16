from fastapi import APIRouter, Depends, HTTPException
from app.core.config import settings
from app.core.database import db_manager, get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(db: AsyncIOMotorDatabase = Depends(get_database)):
    if db_manager.db is None:
        raise HTTPException(status_code=503, detail="Database connection is not initialized")

    if not await db_manager.ping():
        raise HTTPException(status_code=503, detail="MongoDB is unavailable")

    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": settings.DATABASE_NAME,
        "message": "Application and MongoDB are healthy.",
    }
