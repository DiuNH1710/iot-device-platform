from pydantic import BaseModel
from datetime import datetime


class TelemetryCreate(BaseModel):
    data: dict


class TelemetryResponse(BaseModel):
    id: int
    device_id: int
    data: dict
    created_at: datetime

    class Config:
        from_attributes = True


class TelemetryStats(BaseModel):
    metric: str
    avg: float | None
    max: float | None
    min: float | None

    class Config:
        from_attributes = True
