from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database.db import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)

    imei = Column(String(50), unique=True, index=True, nullable=False)

    name = Column(String(255))

    description = Column(Text)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    device_token = Column(Text, nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())