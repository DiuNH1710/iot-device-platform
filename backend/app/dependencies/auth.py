from app.database.db import get_db
from fastapi import Depends
from jose import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.models.user import User
from app.exceptions import UnauthorizedError


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, "secret", algorithms=["HS256"])
        user_id = payload.get("user_id")
    except Exception:
        raise UnauthorizedError("Invalid token")

    user = db.query(User).get(user_id)
    if not user:
        raise UnauthorizedError("User not found")

    return user
