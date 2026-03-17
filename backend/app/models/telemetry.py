from sqlalchemy import Column, Integer, Float, ForeignKey, TIMESTAMP, BigInteger
from sqlalchemy.sql import func
from app.database.db import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(BigInteger, primary_key=True)

    device_id = Column(Integer, ForeignKey("devices.id"), index=True)

    voltage = Column(Float)

    temperature = Column(Float)

    current = Column(Float)

    created_at = Column(TIMESTAMP, server_default=func.now())