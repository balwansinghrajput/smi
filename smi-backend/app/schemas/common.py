from pydantic import BaseModel


class MessageResponse(BaseModel):
    status: str = "success"
    message: str

