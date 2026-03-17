from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.telemetry import Telemetry
from app.models.device import Device
from app.schemas.telemetry_schema import TelemetryCreate


def create_telemetry(db: Session, telemetry: TelemetryCreate):

    # 1 tìm device bằng token
    device = db.query(Device).filter(
        Device.device_token == telemetry.device_token
    ).first()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # 2 tạo telemetry record
    new_telemetry = Telemetry(
        device_id=device.id,
        voltage=telemetry.voltage,
        temperature=telemetry.temperature,
        current=telemetry.current
    )

    db.add(new_telemetry)
    db.commit()
    db.refresh(new_telemetry)

    return new_telemetry