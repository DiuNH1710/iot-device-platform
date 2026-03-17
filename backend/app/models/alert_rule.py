from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey
from app.database.db import Base


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True)

    device_id = Column(Integer, ForeignKey("devices.id"))

    metric_name = Column(String(50))

    condition = Column(String(10))

    threshold = Column(Float)

    message = Column(Text)

    enabled = Column(Boolean, default=True)