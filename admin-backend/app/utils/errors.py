from fastapi import HTTPException, status


class AppError(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class ValidationError(AppError):
    def __init__(self, detail: str = "Validation failed."):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, detail)


class AuthenticationError(AppError):
    def __init__(self, detail: str = "Authentication failed."):
        super().__init__(status.HTTP_401_UNAUTHORIZED, detail)


class AuthorizationError(AppError):
    def __init__(self, detail: str = "Unauthorized."):
        super().__init__(status.HTTP_403_FORBIDDEN, detail)


class DatabaseError(AppError):
    def __init__(self, detail: str = "Database operation failed."):
        super().__init__(status.HTTP_500_INTERNAL_SERVER_ERROR, detail)


class CloudinaryError(AppError):
    def __init__(self, detail: str = "Cloudinary operation failed."):
        super().__init__(status.HTTP_502_BAD_GATEWAY, detail)
