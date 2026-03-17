from sqlalchemy import Column, Integer, Text, String, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database.db import Base


class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True)

    device_id = Column(Integer, ForeignKey("devices.id"))

    rule_id = Column(Integer, ForeignKey("alert_rules.id"))

    message = Column(Text)

    sent_to = Column(String(100))

    sent_at = Column(TIMESTAMP, server_default=func.now())