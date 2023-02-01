import traceback
from typing import List
from fastapi import APIRouter, HTTPException, Request, UploadFile
from db_manager import admin_for_vehicles as afv
from models import VehicleIn, AddOrder
from middlewares import auth_required
from db import db
from utils import uuidv6
import os
from datetime import datetime

vehicles = APIRouter()

super_admin = 'super_admin'
fleet_manager = 'fleet_manager'
ROLES = [super_admin, fleet_manager]


@vehicles.get("/", status_code=201)
async def index():
    return {'status': 'Success from / of vehicles'}


@vehicles.get("/all/{page}", status_code=201)
@auth_required(ROLES)
async def get_vehicles_route(request: Request, page, user=None):
    vehicle_with_location = []
    get_all_vehicle = await afv.get_all_vehicles(request.client.host, int(page), user)
    online_status = await afv.get_online_status()
    vehicle_with_location = afv.insert_online_info_into_vehicles(
        get_all_vehicle, online_status)

    return {'status': 200, 'result': vehicle_with_location}


@vehicles.get("/all_license_plate_no", status_code=201)
@auth_required(ROLES)
async def get_all_license_plate_no(request: Request, user=None):
    response = await afv.get_all_vehicle_license_plate(request.client.host, user)
    return {'status': 200, 'result': response}


@vehicles.get("/get_vehicle/{vehicle_id}", status_code=201)
@auth_required(ROLES)
async def get_vehicles_route(request: Request, vehicle_id: str, user=None):
    get_vehicle = await afv.get_vehicle_by_id(request.client.host, vehicle_id, user)
    online_status = await afv.get_online_status(get_vehicle["vehicle_id"])
    return {'status': 200, 'result': {**get_vehicle, "online_status": online_status}}


@vehicles.get("/get_image/{image_key:path}", status_code=201)
@auth_required(ROLES)
async def get_vehicles_image(request: Request, image_key: str, user=None):
    response = await afv.get_s3image_url(image_key[1:])
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(
            status_code=404, detail='An error occurred while executing transaction')


@vehicles.put("/update_vehicle", status_code=201)
@auth_required(ROLES)
async def update_vehicles_image(request: Request, updatedvehicle: dict, user=None):
    response = await afv.update_new_vehicle(request.client.host, updatedvehicle, user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(
            status_code=404, detail='An error occurred while executing transaction')


@vehicles.put("/update_image_url/{image_key:path}", status_code=201)
@auth_required(ROLES)
async def update_vehicles_image(request: Request, image_key: str, user=None):
    start = len(os.getenv("AWS_IMAGE_KEY"))
    image_uuid = image_key[start + 1: start + 37]

    response = await afv.add_image_to_s3url(image_uuid)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(
            status_code=404, detail='An error occurred while executing transaction')


@vehicles.get("/create_image_url", status_code=201)
@auth_required([super_admin])
async def add_vehicles_image(request: Request, user=None):
    response = await afv.add_image_to_s3url(uuidv6())
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(
            status_code=404, detail='An error occurred while executing transaction')


@vehicles.post("/add_vehicle", status_code=201)
@auth_required([super_admin])
async def add_vehicle(request: Request, vehicle: VehicleIn, user=None):
    response = await afv.add_new_vehicle(request.client.host, vehicle, user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(
            status_code=404, detail='An error occurred while executing transaction')


@vehicles.delete("/delete_image/{image_key:path}", status_code=201)
@auth_required([super_admin])
async def add_vehicles_image(request: Request, image_key: str, user=None):
    response = await afv.delete_image_from_s3(image_key[1:])
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(
            status_code=404, detail='An error occurred while executing transaction')


@vehicles.delete("/delete_vehicle/{vehicle_id}", status_code=201)
@auth_required([super_admin])
async def delete_vehicle(request: Request, vehicle_id: str, user=None):
    response = await afv.delete_vehicle(request.client.host, vehicle_id, user)
    if response['status'] == 200:
        return {**response}
    else:
        HTTPException(status_code=404,
                      detail='An error occurred while executing transaction')


# Order/Requests from Fleet Manager
@vehicles.post("/manager/add_vehicle", status_code=201)
@auth_required([fleet_manager])
async def add_vehicle_request(request: Request, order: AddOrder, user=None):
    response = await afv.add_new_order_req(request.client.host, order, user)
    if response['status'] == 200:
        return {**response}
    else:
        HTTPException(status_code=404,
                      detail='An error occurred while executing transaction')


@vehicles.delete("/manager/delete_vehicle/{vehicle_id}", status_code=201)
@auth_required([fleet_manager])
async def delete_vehicle_request(request: Request, vehicle_id: str, user=None):
    response = await afv.delete_vehicle_order_req(request.client.host, vehicle_id, user)
    if response['status'] == 200:
        return {**response}
    else:
        HTTPException(status_code=404,
                      detail='An error occurred while executing transaction')


@vehicles.get("/locations", status_code=201)
@auth_required(ROLES)
async def get_vehicles_route(request: Request, user=None):
    response = await afv.get_vehicles_with_locations(request.client.host, user)
    # print(f"final response: {response}")
    return {'status': 200, 'result': response}


# @vehicles.get("/filter/driver/{driver_id}", status_code=201)
# @auth_required(ROLES)
# async def get_vehicles_route(request: Request, driver_id: str, user=None):
#     response = await afv.filter_vehicles_by_driver(request.client.host, driver_id, user)
#     return {'status': 200, 'result': response}


@vehicles.post("/current_driver/{vehicle_id}", status_code=201)
@auth_required(ROLES)
async def get_vehicles_route(request: Request, vehicle_id: str, file: UploadFile, user=None):
    file_data = await file.read()
    response = await afv.update_current_driver_info(vehicle_id, file_data, user)
    return {'status': 200, 'result': response}


@vehicles.get("/current_driver/{vehicle_id}", status_code=201)
@auth_required(ROLES)
async def get_vehicles_route(request: Request, vehicle_id: str, user=None):
    response = await afv.get_current_driver_info(vehicle_id, user)
    return {'status': 200, 'result': response}


@vehicles.get("/last_online/{vehicle_id}", status_code=201)
@auth_required(ROLES)
async def get_vehicle_online_time(request: Request, vehicle_id: str, user=None):
    response = await afv.get_last_online_time_for_vehicle(vehicle_id)
    if response:
        return {'status': 200, 'result': response}
    return {'status': 400, 'message': 'Vehicle has not been online yet'}


@vehicles.get("/online_status/{vehicle_id}", status_code=201)
@auth_required(ROLES)
async def get_vehicle_online_status(request: Request, vehicle_id: str, user=None):
    online_status = await afv.get_single_vehicle_online_status(vehicle_id)
    return {'status': 200, 'result': {**online_status}}
