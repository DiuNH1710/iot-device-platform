import math

from app.services import alert_service
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.exceptions import DomainValidationError, NotFoundError
from app.models.telemetry import Telemetry
from app.schemas.telemetry_schema import TelemetryCreate
from app.utils.telemetry_metrics import normalize_telemetry_data


def create_telemetry(db: Session, telemetry: TelemetryCreate, device_id: int):

    raw = telemetry.data
    if not isinstance(raw, dict):
        raise DomainValidationError("data must be a dict")

    data = normalize_telemetry_data(raw)

    new_telemetry = Telemetry(
        device_id=device_id,
        data=data,
    )

    db.add(new_telemetry)
    db.commit()
    db.refresh(new_telemetry)

    alert_service.check_alerts(db, new_telemetry)
    return new_telemetry


def get_device_telemetry(
    db: Session,
    device_id: int,
    limit: int = 100,
    from_time: Optional[datetime] = None,
    to_time: Optional[datetime] = None,
):

    q = db.query(Telemetry).filter(Telemetry.device_id == device_id)
    if from_time is not None:
        q = q.filter(Telemetry.created_at >= from_time)
    if to_time is not None:
        q = q.filter(Telemetry.created_at <= to_time)

    return (
        q.order_by(Telemetry.created_at.desc())
        .limit(limit)
        .all()
    )


def get_latest_telemetry(db: Session, device_id: int):

    telemetry = (
        db.query(Telemetry)
        .filter(Telemetry.device_id == device_id)
        .order_by(Telemetry.created_at.desc())
        .first()
    )

    if not telemetry:
        raise NotFoundError("No telemetry found")

    return telemetry


def get_telemetry_stats(
    db: Session,
    device_id: int,
    metric: str,
    row_limit: int = 10000,
):
    if not metric or not str(metric).strip():
        raise DomainValidationError("metric is required")

    metric_key = str(metric).strip()

    telemetry_list = (
        db.query(Telemetry)
        .filter(Telemetry.device_id == device_id)
        .order_by(Telemetry.created_at.desc())
        .limit(row_limit)
        .all()
    )

    raw_values = [
        t.data.get(metric_key)
        for t in telemetry_list
        if isinstance(t.data, dict) and t.data.get(metric_key) is not None
    ]

    values = []
    for raw in raw_values:
        try:
            value = float(raw)
        except (TypeError, ValueError):
            continue
        if math.isnan(value) or math.isinf(value):
            continue
        values.append(value)

    if not values:
        return {
            "metric": metric_key,
            "avg": None,
            "max": None,
            "min": None,
        }

    return {
        "metric": metric_key,
        "avg": sum(values) / len(values),
        "max": max(values),
        "min": min(values),
    }
