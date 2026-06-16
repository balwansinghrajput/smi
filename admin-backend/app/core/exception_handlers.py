from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.utils.errors import AppError, AuthenticationError, AuthorizationError, DatabaseError, CloudinaryError, ValidationError
from app.utils.logging import log_error


def register_exception_handlers(app):
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        log_error("Validation error", error=str(exc), path=request.url.path)
        return JSONResponse(
            status_code=422,
            content={"status": "error", "message": "Request validation failed.", "details": exc.errors()},
        )

    @app.exception_handler(AuthenticationError)
    async def authentication_exception_handler(request: Request, exc: AuthenticationError):
        log_error("Authentication error", error=str(exc), path=request.url.path)
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": exc.detail},
        )

    @app.exception_handler(AuthorizationError)
    async def authorization_exception_handler(request: Request, exc: AuthorizationError):
        log_error("Authorization error", error=str(exc), path=request.url.path)
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": exc.detail},
        )

    @app.exception_handler(DatabaseError)
    async def database_exception_handler(request: Request, exc: DatabaseError):
        log_error("Database error", error=str(exc), path=request.url.path)
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": exc.detail},
        )

    @app.exception_handler(CloudinaryError)
    async def cloudinary_exception_handler(request: Request, exc: CloudinaryError):
        log_error("Cloudinary error", error=str(exc), path=request.url.path)
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": exc.detail},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        log_error("HTTP exception", error=str(exc.detail), path=request.url.path)
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": exc.detail},
        )

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        log_error("Application error", error=str(exc.detail), path=request.url.path)
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": exc.detail},
        )

    @app.exception_handler(Exception)
    async def internal_exception_handler(request: Request, exc: Exception):
        log_error("Unhandled exception", error=str(exc), path=request.url.path)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "Internal server error."},
        )
