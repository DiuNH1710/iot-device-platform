from typing import List

from app.database.db import get_db
from app.dependencies.auth import get_current_user
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user_schema import UserPublic
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserPublic])
def list_users(
    db: Session = Depends(get_db),
    _current=Depends(get_current_user),
):
    return user_service.list_users_public(db)
