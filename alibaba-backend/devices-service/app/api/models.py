from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, time, timedelta


class DevicesOut(BaseModel):

    device_id: str
    imei: str
    phone_number: str
    serial_number: str
    onboarding_date: str
    batch_number: str
    os_version: str
    allocation_status: bool
    manager_id: Optional[str]
    vehicle_id: Optional[str]
    serial_number_image: str
    created_at: datetime
    updated_at: datetime


class DevicesIn(BaseModel):

    imei: str
    phone_number: str
    serial_number: str
    onboarding_date: str
    batch_number: str
    os_version: str
    allocation_status: bool
    serial_number_image: str
    manager_id: Optional[str]
    vehicle_id: Optional[str]

    def __getitem__(self):
        return {'imei': self.imei,
                'phone_number': self.phone_number,
                'serial_number': self.serial_number,
                'onboarding_date': self.onboarding_date,
                'batch_number': self.onboarding_date,
                'os_version': self.os_version,
                'allocation_status': self.allocation_status,
                'manager_id': self.manager_id,
                'vehicle_id': self.vehicle_id}


class AllocateDevice(BaseModel):
    device_id : str
    vehicle_id : str

class DeviceId(BaseModel):
    device_id : str


class UpdateDevice(BaseModel):
    device_id: str
    imei: str
    phone_number: str
    serial_number: str
    onboarding_date: str
    batch_number: str
    os_version: str
    allocation_status: bool
    manager_id: Optional[str]
    vehicle_id: Optional[str]
    serial_number_image: Optional[str]