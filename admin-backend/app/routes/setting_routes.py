from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.setting import SettingUpdateRequest
from app.schemas.response import BaseResponse
from app.services.setting_service import SettingService

router = APIRouter(prefix="/settings", tags=["Settings"])

def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})


@router.get("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_settings(db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = SettingService(db)
        settings = await service.get_settings()
        return BaseResponse(status="success", message="Settings retrieved.", data=settings.dict(by_alias=True))
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.put("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin"))])
async def update_settings(
    payload: SettingUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = SettingService(db)
        settings = await service.update_settings(payload)
        return BaseResponse(status="success", message="Settings updated.", data=settings.dict(by_alias=True))
    except Exception as exc:
        return _format_error(str(exc), 500)
