from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.response import BaseResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})


@router.get("/summary", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_dashboard_summary(db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = DashboardService(db)
        summary = await service.get_summary()
        return BaseResponse(status="success", message="Dashboard summary retrieved.", data=summary.dict())
    except Exception as exc:
        return _format_error(str(exc), 500)
