from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.auth import get_current_admin, require_roles
from app.core.database import get_database
from app.schemas.user import UserUpdateRequest, PaginatedUsers
from app.schemas.response import BaseResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

def _format_error(message: str, status_code: int):
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message, "data": None})


@router.get("/", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_users(page: int = 1, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = UserService(db)
        page_data = await service.list_users(page=page, page_size=50)
        return BaseResponse(status="success", message="Users retrieved.", data=page_data.dict())
    except Exception as exc:
        return _format_error(str(exc), 400)


@router.get("/{user_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def get_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        service = UserService(db)
        user = await service.get_user(user_id)
        return BaseResponse(status="success", message="User retrieved.", data=user.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.put("/{user_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = UserService(db)
        user = await service.update_user(user_id, payload)
        return BaseResponse(status="success", message="User updated.", data=user.dict(by_alias=True))
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)


@router.delete("/{user_id}", response_model=BaseResponse, dependencies=[Depends(require_roles("super_admin"))])
async def delete_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_admin=Depends(get_current_admin),
):
    try:
        service = UserService(db)
        await service.delete_user(user_id)
        return BaseResponse(status="success", message="User deleted successfully.", data=None)
    except ValueError as exc:
        return _format_error(str(exc), 400)
    except LookupError as exc:
        return _format_error(str(exc), 404)
    except Exception as exc:
        return _format_error(str(exc), 500)
