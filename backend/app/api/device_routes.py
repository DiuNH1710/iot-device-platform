
from app.dependencies.permission import device_permission
from app.dependencies.auth import get_current_user
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.db import get_db
from app.schemas.device_schema import DeviceCreate, DeviceResponse
from app.services import device_service
from app.services import telemetry_service
from app.schemas.telemetry_schema import TelemetryResponse, TelemetryStats
from app.services import device_attribute_service
from app.schemas.device_attribute_schema import (
    DeviceAttributeCreate,
    DeviceAttributeResponse
)
from app.schemas.device_viewer_schema import DeviceViewerEntry

from typing import Optional
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=DeviceResponse)
def create_device(
    device: DeviceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return device_service.create_device(db, device, current_user.id)


@router.get("/", response_model=List[DeviceResponse])
def list_devices(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return device_service.get_devices_by_user(db, current_user.id)


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(
    device_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer"))
):

    return device_service.get_device_or_raise(db, device_id)


@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("owner"))
):

    device_service.delete_device(db, device_id)

    return {"message": "Device deleted"}


@router.get("/{device_id}/telemetry", response_model=List[TelemetryResponse])
def get_device_telemetry(
    device_id: int,
    limit: int = 100,
    from_time: Optional[datetime] = None,
    to_time: Optional[datetime] = None,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission())
):
    device_service.get_device_or_raise(db, device_id)

    return telemetry_service.get_device_telemetry(
        db, device_id, limit, from_time, to_time
    )


@router.get("/{device_id}/telemetry/latest", response_model=TelemetryResponse)
def get_latest_telemetry(
    device_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer"))
):
    device_service.get_device_or_raise(db, device_id)

    return telemetry_service.get_latest_telemetry(db, device_id)


@router.post("/{device_id}/attributes", response_model=DeviceAttributeResponse)
def create_attribute(
    device_id: int,
    data: DeviceAttributeCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("owner"))
):
    device_service.get_device_or_raise(db, device_id)

    return device_attribute_service.create_attribute(db, device_id, data)


@router.get("/{device_id}/attributes", response_model=List[DeviceAttributeResponse])
def get_attributes(
    device_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer"))
):
    device_service.get_device_or_raise(db, device_id)

    return device_attribute_service.get_attributes_by_device(db, device_id)


@router.get("/{device_id}/telemetry/stats", response_model=TelemetryStats)
def get_stats(
    device_id: int,
    metric: str,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer"))
):
    device_service.get_device_or_raise(db, device_id)

    return telemetry_service.get_telemetry_stats(db, device_id, metric=metric)


@router.get("/{device_id}/viewers", response_model=List[DeviceViewerEntry])
def list_viewers(
    device_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer")),
):
    device_service.get_device_or_raise(db, device_id)
    return device_service.list_viewers(db, device_id)


@router.post("/{device_id}/viewers")
def add_viewer(
    device_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("owner"))
):

    return device_service.add_viewer(db, device_id, user_id)


@router.delete("/{device_id}/viewers/{viewer_user_id}")
def remove_viewer(
    device_id: int,
    viewer_user_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("owner")),
):
    device_service.remove_viewer(db, device_id, viewer_user_id)
    return {"message": "Viewer removed"}


@router.delete("/{device_id}/attributes/{attribute_id}")
def delete_attribute(
    device_id: int,
    attribute_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("owner")),
):
    device_attribute_service.delete_attribute(db, device_id, attribute_id)
    return {"message": "Attribute deleted"}
