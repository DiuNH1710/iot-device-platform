from fastapi import Depends, Header
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.device import Device
from app.exceptions import ForbiddenError


def verify_device(
    x_device_token: str = Header(...),
    db: Session = Depends(get_db)
):
    device = db.query(Device).filter(
        Device.device_token == x_device_token
    ).first()

    if not device:
        raise ForbiddenError("Invalid device token")

    return device
