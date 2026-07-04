from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SMI Ecommerce API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "smi"
    MONGODB_MIN_POOL_SIZE: int = 5
    MONGODB_MAX_POOL_SIZE: int = 50

    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"])

    TAX_RATE: float = 0.18
    SHIPPING_FLAT: int = 99
    FREE_SHIPPING_THRESHOLD: int = 5000
    EXPRESS_DELIVERY_AMOUNT: int = 149

    ONLINE_PAYMENT_PROVIDER: str = "razorpay"
    PAYMENT_SUCCESS_URL: str = "http://localhost:5173/checkout/success"
    PAYMENT_CANCEL_URL: str = "http://localhost:5173/checkout/cancel"

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    
    GOOGLE_CLIENT_ID: str = ""

    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = ""
    ADMIN_EMAIL: str = ""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def split_cors_origins(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

