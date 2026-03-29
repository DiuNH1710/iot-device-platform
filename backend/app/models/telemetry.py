from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP, BigInteger, JSON
from sqlalchemy.sql import func
from app.database.db import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(BigInteger, primary_key=True)

    device_id = Column(Integer, ForeignKey("devices.id"), index=True)

    data = Column(JSON, nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
