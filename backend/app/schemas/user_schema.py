from pydantic import BaseModel
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    """Minimal user info for sharing / picker UIs."""

    id: int
    username: str

    class Config:
        from_attributes = True
