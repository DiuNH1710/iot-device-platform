from pydantic import BaseModel
from datetime import datetime

class AlertHistoryResponse(BaseModel):
    id: int
    device_id: int
    rule_id: int
    message: str
    sent_to: str
    sent_at: datetime

    class Config:
        from_attributes = True