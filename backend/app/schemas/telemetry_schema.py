from pydantic import BaseModel


class TelemetryCreate(BaseModel):
    voltage: float
    temperature: float
    current: float


class TelemetryResponse(BaseModel):
    id: int
    device_id: int
    voltage: float
    temperature: float
    current: float

    class Config:
        from_attributes = True
        
        
class TelemetryStats(BaseModel):
    avg_temperature: float | None
    max_temperature: float | None
    min_voltage: float | None

    class Config:
        from_attributes = True