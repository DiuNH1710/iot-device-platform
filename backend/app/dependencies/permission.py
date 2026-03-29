from app.database.db import get_db
from app.dependencies.auth import get_current_user
from fastapi import Depends
from sqlalchemy.orm import Session

from app.services import device_service
from app.exceptions import ForbiddenError, NotFoundError


def device_permission(role: str = "viewer"):

    def checker(
        device_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
    ):
        device = device_service.get_device_by_id(db, device_id)
        if not device:
            raise NotFoundError("Device not found")

        if device.owner_id == current_user.id:
            return True

        if role == "owner":
            raise ForbiddenError("Forbidden")

        if not device_service.is_viewer(db, device_id, current_user.id):
            raise ForbiddenError("Forbidden")

        return True

    return checker
