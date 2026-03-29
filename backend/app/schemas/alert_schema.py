from typing import Optional

from pydantic import BaseModel


class AlertRuleCreate(BaseModel):
    device_id: int
    metric_name: str
    condition: str
    threshold: float
    message: str


class AlertRuleUpdate(BaseModel):
    metric_name: Optional[str] = None
    condition: Optional[str] = None
    threshold: Optional[float] = None
    message: Optional[str] = None
    enabled: Optional[bool] = None


class AlertRuleResponse(AlertRuleCreate):
    id: int
    enabled: bool

    class Config:
        from_attributes = True
