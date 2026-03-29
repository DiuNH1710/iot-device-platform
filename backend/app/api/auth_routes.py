from app.database.db import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import user_service
from app.utils.auth import create_access_token
from app.schemas.user_schema import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, data)


@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = user_service.authenticate_user_or_raise(db, username, password)

    token = create_access_token({"user_id": user.id})
    return {"access_token": token}
