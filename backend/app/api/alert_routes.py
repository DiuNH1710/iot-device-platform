
from app.database.db import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permission import device_permission
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.alert_history_schema import AlertHistoryResponse
from app.schemas.alert_schema import AlertRuleCreate, AlertRuleResponse
from app.services import alert_service, device_service

router = APIRouter(prefix="/alert-rules", tags=["Alert"])


@router.post("/", response_model=AlertRuleResponse)
def create_rule(
    rule: AlertRuleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    device = device_service.get_device_by_id(db, rule.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    if device.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return alert_service.create_alert_rule(db, rule)


@router.get("/{device_id}", response_model=List[AlertRuleResponse])
def get_rules(
    device_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer"))
):
    return alert_service.get_rules_by_device(db, device_id)

@router.get("/device/{device_id}", response_model=List[AlertHistoryResponse])
def get_alert_history(
    device_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: bool = Depends(device_permission("viewer"))
):
    return alert_service.get_alerts_by_device(db, device_id, limit)