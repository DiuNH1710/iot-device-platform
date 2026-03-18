from sqlalchemy.orm import Session
from app.models.alert_rule import AlertRule
from app.models.alert_history import AlertHistory


def create_alert_rule(db: Session, rule):
    new_rule = AlertRule(**rule.dict())
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
        sent_to="telegram"  # sau này dynamic
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