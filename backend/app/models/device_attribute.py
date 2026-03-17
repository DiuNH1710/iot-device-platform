from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database.db import Base


class DeviceAttribute(Base):
    __tablename__ = "device_attributes"

    id = Column(Integer, primary_key=True)

    device_id = Column(Integer, ForeignKey("devices.id"))

    attribute_name = Column(String(100))

    attribute_value = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())