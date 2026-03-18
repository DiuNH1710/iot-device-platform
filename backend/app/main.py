from app.api import alert_routes
from fastapi import FastAPI
from app.api.device_routes import router as device_router
from app.api import telemetry_routes
from app.database.db import Base, engine
from app.models import (
    user,
    device,
    device_viewer,
    telemetry,
    device_attribute,
    alert_rule,
    alert_history
)


Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(device_router, prefix="/devices", tags=["devices"])
app.include_router(telemetry_routes.router)
app.include_router(alert_routes.router)


@app.get("/")
def root():
    return {"message": "IoT platform running"}