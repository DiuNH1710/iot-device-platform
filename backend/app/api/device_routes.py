from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.db import SessionLocal
from app.schemas.device_schema import DeviceCreate, DeviceResponse
from app.services import device_service
from app.database.dependencies import get_db

router = APIRouter()




@router.post("/", response_model=DeviceResponse)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):

    owner_id = 1  # tạm hardcode vì chưa có auth

    return device_service.create_device(db, device, owner_id)


@router.get("/", response_model=List[DeviceResponse])
def list_devices(db: Session = Depends(get_db)):

    return device_service.get_devices(db)


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: int, db: Session = Depends(get_db)):

    device = device_service.get_device_by_id(db, device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return device


@router.delete("/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):

    device = device_service.delete_device(db, device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return {"message": "Device deleted"}