import math
from sqlalchemy.orm import Session
from app.exceptions import DomainValidationError, ForbiddenError, NotFoundError
from app.models.alert_rule import AlertRule
from app.models.alert_history import AlertHistory
from app.schemas.alert_schema import AlertRuleCreate, AlertRuleUpdate
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


def update_alert_rule(db: Session, rule_id: int, patch: AlertRuleUpdate, owner_user_id: int):
    rule = db.query(AlertRule).filter(AlertRule.id == rule_id).first()
    if not rule:
        raise NotFoundError("Alert rule not found")

    device = device_service.get_device_or_raise(db, rule.device_id)
    if device.owner_id != owner_user_id:
        raise ForbiddenError("Forbidden")

    if hasattr(patch, "model_dump"):
        raw = patch.model_dump(exclude_unset=True)
    else:
        raw = patch.dict(exclude_unset=True)
    if not raw:
        return rule

    merged = AlertRuleCreate(
        device_id=rule.device_id,
        metric_name=raw.get("metric_name", rule.metric_name),
        condition=raw.get("condition", rule.condition),
        threshold=raw.get("threshold", rule.threshold),
        message=raw.get("message", rule.message),
    )
    validate_alert_rule(merged)

    for key, val in raw.items():
        setattr(rule, key, val)

    db.commit()
    db.refresh(rule)
    return rule


def get_enabled_rules_by_device(db: Session, device_id: int):
    return db.query(AlertRule).filter(
        AlertRule.device_id == device_id,
        AlertRule.enabled == True,
    ).all()


def get_all_rules_by_device(db: Session, device_id: int):
    return (
        db.query(AlertRule)
        .filter(AlertRule.device_id == device_id)
        .order_by(AlertRule.id.asc())
        .all()
    )


def check_alerts(db: Session, telemetry):

    rules = get_enabled_rules_by_device(db, telemetry.device_id)

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
