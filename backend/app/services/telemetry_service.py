from app.services import alert_service
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.telemetry import Telemetry
from app.models.device import Device
from app.schemas.telemetry_schema import TelemetryCreate


def create_telemetry(db: Session, telemetry: TelemetryCreate, device_id: int):

    new_telemetry = Telemetry(
        device_id=device_id,
        voltage=telemetry.voltage,
        temperature=telemetry.temperature,
        current=telemetry.current
    )

    db.add(new_telemetry)
    db.commit()
    db.refresh(new_telemetry)

    alert_service.check_alerts(db, new_telemetry)
    return new_telemetry

    db.add(new_telemetry)
    db.commit()
    db.refresh(new_telemetry)

    alert_service.check_alerts(db, new_telemetry)
    return new_telemetry

#   lấy list telemetry
def get_device_telemetry(db: Session, device_id: int, limit: int = 100):

    return (
        db.query(Telemetry)
        .filter(Telemetry.device_id == device_id)
        .order_by(Telemetry.created_at.desc())
        .limit(limit)
        .all()
    )


#  lấy latest telemetry
def get_latest_telemetry(db: Session, device_id: int):

    telemetry = (
        db.query(Telemetry)
        .filter(Telemetry.device_id == device_id)
        .order_by(Telemetry.created_at.desc())
        .first()
    )

    if not telemetry:
        raise HTTPException(status_code=404, detail="No telemetry found")

    return telemetry



def get_telemetry_stats(db: Session, device_id: int):
    result = db.query(
        func.avg(Telemetry.temperature),
        func.max(Telemetry.temperature),
        func.min(Telemetry.voltage)
    ).filter(
        Telemetry.device_id == device_id
    ).first()

    return {
        "avg_temperature": result[0],
        "max_temperature": result[1],
        "min_voltage": result[2]
    }