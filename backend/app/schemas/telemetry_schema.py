from pydantic import BaseModel


class TelemetryCreate(BaseModel):
    device_token: str
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