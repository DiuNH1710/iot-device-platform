from pydantic import BaseModel


class DeviceAttributeCreate(BaseModel):
    attribute_name: str
    attribute_value: str


class DeviceAttributeResponse(DeviceAttributeCreate):
    id: int
    device_id: int

    class Config:
        from_attributes  = True