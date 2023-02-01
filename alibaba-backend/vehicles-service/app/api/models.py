from pydantic import BaseModel
from typing import List, Optional


class VehicleOut(BaseModel):
    vehicle_id: str
    vehicle_plate_no: str
    engine_no: str
    chassis_no: str
    color: str
    make_model: str
    weight: str
    number_of_tires: str
    vehicle_image: str
    manager_id: str
    device_id: str


class VehicleIn(BaseModel):
    vehicle_plate_no: str
    engine_no: str
    chassis_no: str
    color: str
    make_model: str
    weight: str
    number_of_tires: str
    vehicle_image : str
    manager_id: Optional[str]
    device_id: Optional[str]

    def __getitem__(self):
        return {'vehicle_plate_no': self.vehicle_plate_no,
                'engine_no': self.engine_no,
                'chassis_no': self.chassis_no,
                'color': self.color,
                'make_model': self.make_model,
                'weight': self.weight,
                'number_of_tires': self.number_of_tires,
                'manager_id': self.manager_id,
                'device_id': self.device_id
                }



class AddOrder(BaseModel):
    vehicle_plate_no: str
    engine_no: str
    chassis_no: str
    color: str
    make_model: str
    weight: str
    number_of_tires: str
    vehicle_image : str


class VehicleInfo(BaseModel):
    vehicle_id: str
    vehicle_plate_no: str
    longitude: str
    latitude: str
    location_time: str
    location: str
    speed: str
    is_online: bool
    driver_id: str
    auth_status_time: str
    is_auth: bool
    