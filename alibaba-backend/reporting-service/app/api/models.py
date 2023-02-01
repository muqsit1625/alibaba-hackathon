from pydantic import BaseModel
from datetime import datetime


class Anomaly(BaseModel):
    anomaly_type: str
    anomaly_details: str
    trip_id: str
    driver_id: str
    vehicle_id: str
    session_id: str


class Trip(BaseModel):
    trip_id: str = None
    vehicle_id: str
    status: str
    start_time: str
