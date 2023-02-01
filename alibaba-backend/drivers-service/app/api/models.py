from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime, time, timedelta


class DriversOut(BaseModel):
    driver_id: str
    driver_first_name: str
    driver_last_name: str
    cnic: str
    license_number: str
    phone_number: str
    address: str
    driver_media_url: str  # (picture)
    vehicle_id: Optional[str]
    manager_id: Optional[str]


class DriversList(BaseModel):
    status: int
    result: List[Union[DriversOut, None]]


class SingleDriver(BaseModel):
    status: int
    result: Union[DriversOut, str, None]


class DriverIn(BaseModel):
    driver_first_name: str
    driver_last_name: str
    cnic: str
    license_number: str
    phone_number: str
    address: str
    vehicle_id: Optional[str]
    driver_media_url: str
    driver_image: Optional[str]


class DriversUpdate(BaseModel):
    driver_id: str
    driver_first_name: str
    driver_last_name: str
    cnic: str
    license_number: str
    phone_number: str
    address: str
    driver_media_url: Optional[str]  # (picture)
    driver_image: Optional[str]
    vehicle_id: Optional[str]
    embedding: Optional[list[list[str]]]


class AssignVehicle(BaseModel):
    vehicle_id: str
    driver_id: str


class UnAssignVehicle(BaseModel):
    driver_id: str
