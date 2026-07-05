# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import db_manager
from app.core.exception_handlers import register_exception_handlers
from app.routes import router as api_router

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,  # Hide docs in production if needed
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    )

    # Configure CORS (Cross-Origin Resource Sharing)
    if settings.ENVIRONMENT == "production" and settings.FRONTEND_URL:
        cors_origins = [settings.FRONTEND_URL]
    else:
        cors_origins = ["*"]

    application.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routers
    application.include_router(api_router, prefix=settings.API_V1_STR)

    # Register centralized exception handlers
    register_exception_handlers(application)

    @application.on_event("startup")
    async def startup_db_client() -> None:
        db_manager.connect_to_mongo()
        if not await db_manager.ping():
            raise RuntimeError("Unable to connect to MongoDB during startup.")

        from app.services.admin_service import AdminService
        from app.core.config import settings

        if settings.SUPER_ADMIN_EMAIL and settings.SUPER_ADMIN_PASSWORD:
            service = AdminService(db_manager.db)
            await service.ensure_indexes()
            await service.ensure_super_admin(
                settings.SUPER_ADMIN_EMAIL,
                settings.SUPER_ADMIN_PASSWORD,
                settings.SUPER_ADMIN_PHONE,
            )

    @application.on_event("shutdown")
    async def shutdown_db_client() -> None:
        db_manager.close_mongo_connection()

    return application

app = create_application()