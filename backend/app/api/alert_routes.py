
from app.database.db import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permission import device_permission
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.schemas.alert_history_schema import AlertHistoryResponse
from app.schemas.alert_schema import AlertRuleCreate, AlertRuleResponse, AlertRuleUpdate
from app.services import alert_service, device_service

router = APIRouter(prefix="/alert-rules", tags=["Alert"])


@router.post("/", response_model=AlertRuleResponse)
def create_rule(
    rule: AlertRuleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    device_service.assert_device_owner(db, rule.device_id, current_user.id)
    return alert_service.create_alert_rule(db, rule)


@router.get("/{device_id}", response_model=List[AlertRuleResponse])
def get_rules(
    device_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer"))
):
    return alert_service.get_all_rules_by_device(db, device_id)


@router.patch("/rules/{rule_id}", response_model=AlertRuleResponse)
def update_rule(
    rule_id: int,
    body: AlertRuleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return alert_service.update_alert_rule(db, rule_id, body, current_user.id)


@router.get("/device/{device_id}", response_model=List[AlertHistoryResponse])
def get_alert_history(
    device_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer"))
):
    return alert_service.get_alerts_by_device(db, device_id, limit)
