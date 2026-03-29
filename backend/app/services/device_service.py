from sqlalchemy import or_
import uuid
from sqlalchemy.orm import Session
from app.exceptions import ConflictError, DomainValidationError, ForbiddenError, NotFoundError
from app.models.user import User
from app.models.device_viewers import DeviceViewer
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


def get_device_or_raise(db: Session, device_id: int) -> Device:
    device = get_device_by_id(db, device_id)
    if not device:
        raise NotFoundError("Device not found")
    return device


def assert_device_owner(db: Session, device_id: int, user_id: int) -> Device:
    device = get_device_or_raise(db, device_id)
    if device.owner_id != user_id:
        raise ForbiddenError("Forbidden")
    return device


def get_devices_by_user(db: Session, user_id: int):
    return db.query(Device).outerjoin(DeviceViewer).filter(
        or_(
            Device.owner_id == user_id,
            DeviceViewer.user_id == user_id
        )
    ).all()


def delete_device(db: Session, device_id: int):

    device = db.query(Device).filter(Device.id == device_id).first()

    if not device:
        raise NotFoundError("Device not found")

    db.delete(device)
    db.commit()

    return device


def add_viewer(db: Session, device_id: int, user_id: int):

    device = get_device_by_id(db, device_id)
    if not device:
        raise NotFoundError("Device not found")

    exists = db.query(DeviceViewer).filter(
        DeviceViewer.device_id == device_id,
        DeviceViewer.user_id == user_id
    ).first()

    if exists:
        raise ConflictError("Viewer already exists")

    if device.owner_id == user_id:
        raise DomainValidationError("Owner cannot be viewer")

    viewer = DeviceViewer(
        device_id=device_id,
        user_id=user_id
    )

    db.add(viewer)
    db.commit()
    db.refresh(viewer)

    return viewer


def is_viewer(db: Session, device_id: int, user_id: int) -> bool:
    return db.query(DeviceViewer).filter(
        DeviceViewer.device_id == device_id,
        DeviceViewer.user_id == user_id
    ).first() is not None


def list_viewers(db: Session, device_id: int):
    rows = (
        db.query(DeviceViewer, User.username)
        .join(User, User.id == DeviceViewer.user_id)
        .filter(DeviceViewer.device_id == device_id)
        .order_by(DeviceViewer.created_at.asc())
        .all()
    )
    return [
        {"user_id": dv.user_id, "username": uname, "created_at": dv.created_at}
        for dv, uname in rows
    ]


def remove_viewer(db: Session, device_id: int, viewer_user_id: int):
    row = db.query(DeviceViewer).filter(
        DeviceViewer.device_id == device_id,
        DeviceViewer.user_id == viewer_user_id,
    ).first()
    if not row:
        raise NotFoundError("Viewer not found")
    db.delete(row)
    db.commit()
