
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.db import SessionLocal
from app.schemas.device_schema import DeviceCreate, DeviceResponse
from app.services import device_service
from app.services import telemetry_service
from app.schemas.telemetry_schema import TelemetryResponse, TelemetryStats
from app.database.dependencies import get_db
from app.services import device_attribute_service
from app.schemas.device_attribute_schema import (
    DeviceAttributeCreate,
    DeviceAttributeResponse
)

from typing import Optional
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=DeviceResponse)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):

    owner_id = 1  # tạm hardcode vì chưa có auth

    return device_service.create_device(db, device, owner_id)


@router.get("/", response_model=List[DeviceResponse])
def list_devices(db: Session = Depends(get_db)):

    return device_service.get_devices(db)


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: int, db: Session = Depends(get_db)):

    device = device_service.get_device_by_id(db, device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return device


@router.delete("/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):

    device = device_service.delete_device(db, device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return {"message": "Device deleted"}


@router.get("/{device_id}/telemetry", response_model=List[TelemetryResponse])
def get_device_telemetry(
    device_id: int,
    limit: int = 100,
    from_time: Optional[datetime] = None,
    to_time: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return telemetry_service.get_device_telemetry(
        db, device_id, limit, from_time, to_time
    )


@router.get("/{device_id}/telemetry/latest", response_model=TelemetryResponse)
def get_latest_telemetry(
    device_id: int,
    db: Session = Depends(get_db)
):
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    telemetry = telemetry_service.get_latest_telemetry(db, device_id)

    if not telemetry:
        raise HTTPException(status_code=404, detail="No telemetry found")
    return telemetry


@router.post("/{device_id}/attributes", response_model=DeviceAttributeResponse)
def create_attribute(
    device_id: int,
    data: DeviceAttributeCreate,
    db: Session = Depends(get_db)
):
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return device_attribute_service.create_attribute(db, device_id, data)


@router.get("/{device_id}/attributes", response_model=List[DeviceAttributeResponse])
def get_attributes(
    device_id: int,
    db: Session = Depends(get_db)
):
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return device_attribute_service.get_attributes_by_device(db, device_id)




@router.get("/{device_id}/telemetry/stats", response_model=TelemetryStats)
def get_stats(device_id: int, db: Session = Depends(get_db)):
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return telemetry_service.get_telemetry_stats(db, device_id)