import math
from sqlalchemy.orm import Session
from app.exceptions import DomainValidationError
from app.models.alert_rule import AlertRule
from app.models.alert_history import AlertHistory
from app.schemas.alert_schema import AlertRuleCreate
from app.utils.telemetry_metrics import get_metric_value

ALLOWED_CONDITIONS = frozenset({">", "<", ">=", "<=", "=="})


def validate_alert_rule(rule: AlertRuleCreate) -> None:
    if not rule.metric_name or not str(rule.metric_name).strip():
        raise DomainValidationError("metric_name is required")
    if rule.condition not in ALLOWED_CONDITIONS:
        raise DomainValidationError(f"Invalid condition: {rule.condition!r}")
    if math.isnan(rule.threshold) or math.isinf(rule.threshold):
        raise DomainValidationError("Threshold must be a finite number")


def create_alert_rule(db: Session, rule: AlertRuleCreate):
    validate_alert_rule(rule)
    payload = rule.model_dump() if hasattr(rule, "model_dump") else rule.dict()
    new_rule = AlertRule(**payload)
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule


def get_rules_by_device(db: Session, device_id: int):
    return db.query(AlertRule).filter(
        AlertRule.device_id == device_id,
        AlertRule.enabled == True
    ).all()


def check_alerts(db: Session, telemetry):

    rules = get_rules_by_device(db, telemetry.device_id)

    ops = {
        ">": lambda a, b: a > b,
        "<": lambda a, b: a < b,
        "==": lambda a, b: a == b,
        ">=": lambda a, b: a >= b,
        "<=": lambda a, b: a <= b,
    }

    data = telemetry.data if isinstance(getattr(telemetry, "data", None), dict) else {}

    for rule in rules:

        value = get_metric_value(data, rule.metric_name)
        if value is None:
            continue

        op = ops.get(rule.condition)
        if op is None:
            continue

        try:
            triggered = op(value, float(rule.threshold))
        except (TypeError, ValueError):
            continue

        if triggered:
            save_alert(db, telemetry, rule)


def save_alert(db: Session, telemetry, rule):

    alert = AlertHistory(
        device_id=telemetry.device_id,
        rule_id=rule.id,
        message=rule.message,
        sent_to="telegram"
    )

    db.add(alert)
    db.commit()


def get_alerts_by_device(db: Session, device_id: int, limit: int = 50):
    return (
        db.query(AlertHistory)
        .filter(AlertHistory.device_id == device_id)
        .order_by(AlertHistory.sent_at.desc())
        .limit(limit)
        .all()
    )
