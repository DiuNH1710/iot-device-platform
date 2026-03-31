from typing import Optional

from pydantic import BaseModel
from datetime import datetime


class AlertRuleCreate(BaseModel):
    device_id: int
    metric_name: str
    condition: str
    threshold: float
    message: str
    cooldown_seconds: int = 300


class AlertRuleUpdate(BaseModel):
    metric_name: Optional[str] = None
    condition: Optional[str] = None
    threshold: Optional[float] = None
    message: Optional[str] = None
    enabled: Optional[bool] = None
    cooldown_seconds: Optional[int] = None


class AlertRuleResponse(AlertRuleCreate):
    id: int
    enabled: bool
    last_triggered_at: Optional[datetime] = None
    is_triggered: bool = False

    class Config:
        from_attributes = True
