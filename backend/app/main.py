from sqlalchemy.exc import IntegrityError

from app.api import alert_routes
from app.models import device_viewers
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.api.device_routes import router as device_router
from app.api import telemetry_routes
from app.api import auth_routes
from app.database.db import Base, engine
from app.exceptions import (
    AppError,
    ConflictError,
    DomainValidationError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
)
from app.models import (
    user,
    device,
    telemetry,
    device_attribute,
    alert_rule,
    alert_history,
)


Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(device_router, prefix="/devices", tags=["devices"])
app.include_router(telemetry_routes.router)
app.include_router(alert_routes.router)
app.include_router(auth_routes.router)


@app.exception_handler(UnauthorizedError)
async def unauthorized_handler(_: Request, exc: UnauthorizedError):
    return JSONResponse(status_code=401, content={"detail": exc.message})


@app.exception_handler(NotFoundError)
async def not_found_handler(_: Request, exc: NotFoundError):
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(ForbiddenError)
async def forbidden_handler(_: Request, exc: ForbiddenError):
    return JSONResponse(status_code=403, content={"detail": exc.message})


@app.exception_handler(ConflictError)
async def conflict_handler(_: Request, exc: ConflictError):
    return JSONResponse(status_code=409, content={"detail": exc.message})


@app.exception_handler(DomainValidationError)
async def domain_validation_handler(_: Request, exc: DomainValidationError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError):
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(IntegrityError)
async def integrity_error_handler(_: Request, __: IntegrityError):
    return JSONResponse(
        status_code=400,
        content={"detail": "Database constraint violation"},
    )


@app.get("/")
def root():
    return {"message": "IoT platform running"}
