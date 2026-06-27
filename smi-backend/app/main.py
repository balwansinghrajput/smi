from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.database.mongodb import mongo
from app.middleware.exception_handlers import register_exception_handlers
from app.repositories.review_repository import ReviewRepository
from app.repositories.user_repository import UserRepository
from app.routes import api_router
from app.utils.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    mongo.connect()
    if not await mongo.ping():
        raise RuntimeError("Unable to connect to MongoDB")
    await UserRepository(mongo.db).ensure_indexes()
    await ReviewRepository(mongo.db).ensure_indexes()
    yield
    mongo.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(app)
    app.include_router(api_router)

    @app.get("/health", tags=["Health"])
    async def health():
        return {"status": "ok"}

    return app


app = create_app()

