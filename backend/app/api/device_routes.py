from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_devices():
    return {"message": "list devices"}

@router.post("/")
def create_device():
    return {"message": "create device"}