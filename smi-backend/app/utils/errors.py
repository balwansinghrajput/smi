from fastapi import HTTPException, status


class AppHTTPException(HTTPException):
    def __init__(self, status_code: int, message: str):
        super().__init__(status_code=status_code, detail=message)


class NotFoundError(AppHTTPException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, message)


class BadRequestError(AppHTTPException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(status.HTTP_400_BAD_REQUEST, message)


class UnauthorizedError(AppHTTPException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, message)


class ForbiddenError(AppHTTPException):
    def __init__(self, message: str = "Not allowed"):
        super().__init__(status.HTTP_403_FORBIDDEN, message)

