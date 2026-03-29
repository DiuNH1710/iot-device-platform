import math
from sqlalchemy.orm import Session
from app.exceptions import DomainValidationError
from app.models.alert_rule import AlertRule
from app.models.alert_history import AlertHistory
from app.schemas.alert_schema import AlertRuleCreate

ALLOWED_METRICS = frozenset({"voltage", "temperature", "current"})
ALLOWED_CONDITIONS = frozenset({">", "<", ">=", "<="})


def validate_alert_rule(rule: AlertRuleCreate) -> None:
    if rule.metric_name not in ALLOWED_METRICS:
        raise DomainValidationError(f"Invalid metric_name: {rule.metric_name!r}")
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

    for rule in rules:

        value = getattr(telemetry, rule.metric_name)

        triggered = False

        if rule.condition == ">":
            triggered = value > rule.threshold
        elif rule.condition == "<":
            triggered = value < rule.threshold
        elif rule.condition == ">=":
            triggered = value >= rule.threshold
        elif rule.condition == "<=":
            triggered = value <= rule.threshold

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
