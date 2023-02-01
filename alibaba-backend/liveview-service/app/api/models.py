from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime, time, timedelta


class Anomaly(BaseModel):
    anomaly_type : str
    anomaly_details : str
    trip_id : str
    driver_id : str
    vehicle_id : str
    session_id : str


class DriversOut(BaseModel):
    driver_id : str
    driver_first_name : str
    driver_last_name : str
    cnic : str
    license_number : str
    phone_number : str
    address : str
    driver_media_url : str  # (picture)
    vehicle_id : Optional[str]
    manager_id : Optional[str]


class DriversList(BaseModel):
    status : int
    result : List[Union[DriversOut, None]]

class SingleDriver(BaseModel):
    status : int
    result : Union[DriversOut, str, None]


class DriverIn(BaseModel):
    driver_first_name : str
    driver_last_name : str
    cnic : str
    license_number : str
    phone_number : str
    address : str
    vehicle_id : Optional[str]

    

class DriversUpdate(BaseModel):
    driver_id : str
    driver_first_name : str
    driver_last_name : str
    cnic : str
    license_number : str
    phone_number : str
    address : str
    driver_media_url : Optional[str]  # (picture)
    vehicle_id : Optional[str]


class AssignVehicle(BaseModel):
    vehicle_id : str
    driver_id : str

class UnAssignVehicle(BaseModel):
    driver_id : str