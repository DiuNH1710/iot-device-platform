from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# request khi tạo device
class DeviceCreate(BaseModel):
    imei: str
    name: str
    description: Optional[str] = None


# response trả về client
class DeviceResponse(BaseModel):
    id: int
    imei: str
    name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True