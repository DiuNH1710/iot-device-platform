import uuid
from fastapi import Depends
from app.database.dependencies import get_current_user
from sqlalchemy.orm import Session
from app.models.device_viewers import DeviceViewer
from app.models.device import Device
from app.schemas.device_schema import DeviceCreate


def create_device(db: Session, device_data: DeviceCreate,  current_user=Depends(get_current_user)):

    device_token = str(uuid.uuid4())

    device = Device(
        imei=device_data.imei,
        name=device_data.name,
        description=device_data.description,
        owner_id=current_user.id,
        device_token=device_token
    )

    db.add(device)
    db.commit()
    db.refresh(device)

    return device


def get_devices(db: Session):
    return db.query(Device).all()


def get_device_by_id(db: Session, device_id: int):
    return db.query(Device).filter(Device.id == device_id).first()


def delete_device(db: Session, device_id: int):

    device = db.query(Device).filter(Device.id == device_id).first()

    if not device:
        return None

    db.delete(device)
    db.commit()

    return device

def add_viewer(db: Session, device_id: int, user_id: int):
    viewer = DeviceViewer(device_id=device_id, user_id=user_id)
    db.add(viewer)
    db.commit()
    return viewer

def check_permission(db: Session, device_id: int, user_id: int):
    device = db.query(Device).filter(Device.id == device_id).first()
    if device.owner_id == user_id:
        return True

    viewer = db.query(DeviceViewer).filter(
        DeviceViewer.device_id == device_id,
        DeviceViewer.user_id == user_id
    ).first()

    return viewer is not None