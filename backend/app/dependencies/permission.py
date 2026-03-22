from app.database.db import get_db
from app.dependencies.auth import get_current_user
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session


from app.services import device_service


def device_permission(role: str = "viewer"):

    def checker(
        device_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
    ):
        device = device_service.get_device_by_id(db, device_id)
        if not device:
            raise HTTPException(404, "Device not found")

        # owner luôn pass
        if device.owner_id == current_user.id:
            return True

        # nếu cần owner thì reject luôn
        if role == "owner":
            raise HTTPException(403, "Forbidden")

        # check viewer
        is_viewer = device_service.is_viewer(db, device_id, current_user.id)
        
        if not device_service.is_viewer(db, device_id, current_user.id):
            raise HTTPException(403, "Forbidden")

        return True

    return checker