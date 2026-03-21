from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database.db import Base


class DeviceViewer(Base):
    __tablename__ = "device_viewers"

    id = Column(Integer, primary_key=True)

    device_id = Column(Integer, ForeignKey("devices.id"))

    user_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(TIMESTAMP, server_default=func.now())