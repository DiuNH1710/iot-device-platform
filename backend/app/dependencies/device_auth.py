from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.device import Device


def verify_device(
    x_device_token: str = Header(...), 
    db: Session = Depends(get_db)
):
    device = db.query(Device).filter(
        Device.device_token == x_device_token
    ).first()

    if not device:
        raise HTTPException(status_code=403, detail="Invalid device token")

    return device