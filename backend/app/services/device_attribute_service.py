from sqlalchemy.orm import Session
from app.models.device_attribute import DeviceAttribute


def create_attribute(db: Session, device_id: int, data):

    existing = db.query(DeviceAttribute).filter(
        DeviceAttribute.device_id == device_id,
        DeviceAttribute.attribute_name == data.attribute_name
    ).first()

    if existing:
        existing.attribute_value = data.attribute_value
        db.commit()
        db.refresh(existing)
        return existing

    attr = DeviceAttribute(
        device_id=device_id,
        attribute_name=data.attribute_name,
        attribute_value=data.attribute_value
    )

    db.add(attr)
    db.commit()
    db.refresh(attr)

    return attr


def get_attributes_by_device(db: Session, device_id: int):

    return db.query(DeviceAttribute).filter(
        DeviceAttribute.device_id == device_id
    ).all()