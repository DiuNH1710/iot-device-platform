from pydantic import BaseModel


class AlertRuleCreate(BaseModel):
    device_id: int
    metric_name: str
    condition: str
    threshold: float
    message: str


class AlertRuleResponse(AlertRuleCreate):
    id: int
    enabled: bool

    class Config:
        from_attributes  = True