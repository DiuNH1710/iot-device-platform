from fastapi import FastAPI
from app.api.device_routes import router as device_router

app = FastAPI()

app.include_router(device_router, prefix="/devices", tags=["devices"])

@app.get("/")
def root():
    return {"message": "IoT platform running"}