from app.database.db import get_db
from app.dependencies.device_auth import verify_device
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.telemetry_schema import TelemetryCreate, TelemetryResponse
from app.services import telemetry_service

router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry"]
)


@router.post("/", response_model=TelemetryResponse)
def create_telemetry(
    telemetry: TelemetryCreate,
    device = Depends(verify_device), 
    db: Session = Depends(get_db)
):
    return telemetry_service.create_telemetry(
        db,
        telemetry,
        device.id  
    )