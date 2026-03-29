from datetime import datetime

from pydantic import BaseModel


class DeviceViewerEntry(BaseModel):
    user_id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
