import uuid
from sqlalchemy.orm import Session

from app.models.device import Device
from app.schemas.device_schema import DeviceCreate


def create_device(db: Session, device_data: DeviceCreate, owner_id: int):

    device_token = str(uuid.uuid4())

    device = Device(
        imei=device_data.imei,
        name=device_data.name,
        description=device_data.description,
        owner_id=owner_id,
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