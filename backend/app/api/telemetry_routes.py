from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.telemetry_schema import TelemetryCreate, TelemetryResponse
from app.services import telemetry_service

router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry"]
)


@router.post("/", response_model=TelemetryResponse)
def create_telemetry(
    telemetry: TelemetryCreate,
    db: Session = Depends(get_db)
):
    return telemetry_service.create_telemetry(db, telemetry)