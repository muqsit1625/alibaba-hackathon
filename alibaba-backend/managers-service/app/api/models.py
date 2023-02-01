from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime, time, timedelta


class ManagersOut(BaseModel):
    manager_id : str
    company_name : str
    dob : str
    cnic : str
    address : str
    image : Optional[str]
    face_sides : Optional[List[str]]
    cnic_images : Optional[List[str]]
    first_name : str
    last_name : str
    email : str
    phone_number : str
    created_at : datetime
    updated_at : datetime


class ManagersList(BaseModel):
    status : int
    result : List[Union[ManagersOut, None]]

class SingleManager(BaseModel):
    status : int
    result : Union[ManagersOut, str, None]

class ManagersIn(BaseModel):
    company_name : str
    dob : str
    cnic : str
    address : str
    first_name : str
    last_name : str
    email : str
    phone_number : str
    image : str
    face_sides : List[str]
    cnic_images : List[str]
    password : str
    

class ManagersUpdate(BaseModel):
    manager_id : str
    company_name : str
    dob : str
    cnic : str
    address : str
    first_name : str
    last_name : str
    email : str
    phone_number : str
