import math
from datetime import datetime

from sqlalchemy.orm import Session
from app.exceptions import DomainValidationError, ForbiddenError, NotFoundError
from app.models.alert_rule import AlertRule
from app.models.alert_history import AlertHistory
from app.schemas.alert_schema import AlertRuleCreate, AlertRuleUpdate
from app.services import device_service
from app.services.telegram_service import send_telegram_message as send_telegram_message_via_bot
from app.utils.telemetry_metrics import get_metric_value

ALLOWED_CONDITIONS = frozenset({">", "<", ">=", "<=", "=="})


def validate_alert_rule(rule: AlertRuleCreate) -> None:
    if not rule.metric_name or not str(rule.metric_name).strip():
        raise DomainValidationError("metric_name is required")
    if rule.condition not in ALLOWED_CONDITIONS:
        raise DomainValidationError(f"Invalid condition: {rule.condition!r}")
    if math.isnan(rule.threshold) or math.isinf(rule.threshold):
        raise DomainValidationError("Threshold must be a finite number")
    if rule.cooldown_seconds < 0:
        raise DomainValidationError("cooldown_seconds must be >= 0")


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
        cooldown_seconds=raw.get("cooldown_seconds", rule.cooldown_seconds),
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
    data = telemetry.data if isinstance(getattr(telemetry, "data", None), dict) else {}
    timestamp = getattr(telemetry, "created_at", None) or datetime.utcnow()

    device = device_service.get_device_by_id(db, telemetry.device_id)
    device_name = (device.name if device and device.name else f"Device {telemetry.device_id}")

    for rule in rules:
        value = get_metric_value(data, rule.metric_name)
        if value is None:
            continue

        triggered = evaluate_condition(value, rule.condition, rule.threshold)
        if triggered is None:
            continue

        now = datetime.utcnow()

        if triggered and not rule.is_triggered:
            message = format_alert_message(
                device_name=device_name,
                metric=rule.metric_name,
                value=value,
                condition=rule.condition,
                threshold=rule.threshold,
                timestamp=timestamp,
            )
            if send_telegram_message(message):
                save_alert(db, telemetry, rule, message)
            rule.is_triggered = True
            rule.last_triggered_at = now
            db.commit()
            continue

        if triggered and rule.is_triggered:
            if not should_send_reminder(rule, now):
                continue
            message = format_reminder_message(
                device_name=device_name,
                metric=rule.metric_name,
                value=value,
                timestamp=timestamp,
            )
            if send_telegram_message(message):
                save_alert(db, telemetry, rule, message)
            rule.last_triggered_at = now
            db.commit()
            continue

        if should_send_recovery(rule, triggered):
            message = format_recovery_message(
                device_name=device_name,
                metric=rule.metric_name,
                value=value,
                timestamp=timestamp,
            )
            if send_telegram_message(message):
                save_alert(db, telemetry, rule, message)
            rule.is_triggered = False
            rule.last_triggered_at = None
            db.commit()


def evaluate_condition(value, condition: str, threshold: float):
    ops = {
        ">": lambda a, b: a > b,
        "<": lambda a, b: a < b,
        "==": lambda a, b: a == b,
        ">=": lambda a, b: a >= b,
        "<=": lambda a, b: a <= b,
    }
    op = ops.get(condition)
    if op is None:
        return None
    try:
        return op(value, float(threshold))
    except (TypeError, ValueError):
        return None


def should_send_reminder(rule: AlertRule, now: datetime) -> bool:
    if not rule.is_triggered:
        return False
    if rule.last_triggered_at is None:
        return True
    cooldown_seconds = rule.cooldown_seconds if rule.cooldown_seconds is not None else 300
    elapsed_seconds = (now - rule.last_triggered_at).total_seconds()
    return elapsed_seconds >= cooldown_seconds


def should_send_recovery(rule: AlertRule, currently_triggered: bool) -> bool:
    return rule.is_triggered and not currently_triggered


def send_telegram_message(message: str) -> bool:
    return send_telegram_message_via_bot(message)


def _format_timestamp(value: datetime) -> str:
    return value.strftime("%Y-%m-%d %H:%M:%S UTC")


def format_alert_message(
    device_name: str,
    metric: str,
    value,
    condition: str,
    threshold: float,
    timestamp: datetime,
) -> str:
    return (
        "🚨 ALERT TRIGGERED\n"
        "Bot: hust_telemetry_alert_bot\n"
        f"Device: {device_name}\n"
        f"Metric: {metric}\n"
        f"Value: {value}\n"
        f"Condition: {condition} {threshold}\n"
        f"Time: {_format_timestamp(timestamp)}"
    )


def format_reminder_message(
    device_name: str,
    metric: str,
    value,
    timestamp: datetime,
) -> str:
    return (
        "⚠️ ALERT STILL ACTIVE\n"
        "Bot: hust_telemetry_alert_bot\n"
        f"Device: {device_name}\n"
        f"Metric: {metric}\n"
        f"Current Value: {value}\n"
        f"Time: {_format_timestamp(timestamp)}"
    )


def format_recovery_message(
    device_name: str,
    metric: str,
    value,
    timestamp: datetime,
) -> str:
    return (
        "✅ DEVICE RECOVERED\n"
        "Bot: hust_telemetry_alert_bot\n"
        f"Device: {device_name}\n"
        f"Metric: {metric}\n"
        f"Current Value: {value}\n"
        f"Time: {_format_timestamp(timestamp)}"
    )


def save_alert(db: Session, telemetry, rule, message: str):
    alert = AlertHistory(
        device_id=telemetry.device_id,
        rule_id=rule.id,
        message=message,
        sent_to="telegram",
    )

    db.add(alert)


def get_alerts_by_device(db: Session, device_id: int, limit: int = 50):
    return (
        db.query(AlertHistory)
        .filter(AlertHistory.device_id == device_id)
        .order_by(AlertHistory.sent_at.desc())
        .limit(limit)
        .all()
    )
