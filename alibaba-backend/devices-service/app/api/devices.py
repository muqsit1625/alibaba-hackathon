from typing import List, Optional
from fastapi import APIRouter, HTTPException, Request
from db import db
from models import DevicesIn, AllocateDevice, DeviceId, UpdateDevice
from db_manager import admin_for_devices as afd
from middlewares import auth_required
from utils import uuidv6
import os

devices = APIRouter()
ROLES = ['super_admin']


@devices.get("/all", status_code=201)
@auth_required(ROLES)
async def get_devices_route(request: Request, user=None):
    response = await afd.get_all_devices(request.client.host)
    return {'status': 200, 'result': response}


@devices.post("/add_device", status_code=201)
@auth_required(ROLES)
async def add_device_route(request: Request, device: DevicesIn, user=None):
    response = await afd.add_new_device(request.client.host, device, user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')


@devices.get("/get_device/{device_id}", status_code=201)
@auth_required(ROLES)
async def filter_device_route(request: Request, device_id: str, user=None):
    response = await afd.get_device_by_id(device_id)
    return {'status': 200, 'result': response}


@devices.get("/get_device_by_serial/{serial_number}", status_code=201)
@auth_required(ROLES)
async def filter_device_route_by_serial(request: Request, serial_number: str, user=None):
    response = await afd.get_device_by_serial_number(serial_number)
    return {'status': 200, 'result': response}


@devices.get("/filter_by_manager/{manager_id}", status_code=201)
@auth_required(ROLES)
async def filter_device_route_by_manager(request: Request, manager_id: str, user=None):
    response = await afd.filter_devices(request.client.host, manager_id)
    return {'status': 200, 'result': response}


@devices.delete("/delete_device/{device_id}", status_code=201)
@auth_required(ROLES)
async def delete_device_route(request: Request, device_id: str, user=None):
    response = await afd.delete_device(request.client.host, device_id, user)
    if response['status'] == 200:
        return {**response}
    else:
        HTTPException(status_code=404, detail='An error occurred while executing transaction')


# Use this URL like : http://localhost:8080/api/v1/managers/get_image//managers/1ecd8153-ce13-6f08-a3ae-0242ac130005.jpeg
@devices.get("/get_image/{image_key:path}", status_code=201)
@auth_required(ROLES)
async def get_devices_image(request: Request, image_key: str, user=None):
    response = await afd.get_s3image_url(image_key[1:])
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')


@devices.get("/create_image_url", status_code=201)
@auth_required(ROLES)
async def add_devices_image(request: Request, user=None):
    response = await afd.add_image_to_s3url(uuidv6())
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')


@devices.put("/update_image_url/{image_key:path}", status_code=201)
@auth_required(ROLES)
async def update_devices_image(request: Request, image_key: str, user=None):
    start = len(os.getenv("AWS_IMAGE_KEY"))
    image_uuid = image_key[start + 1: start + 37]
    response = await afd.add_image_to_s3url(image_uuid)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')


@devices.delete("/delete_image/{image_key:path}", status_code=201)
@auth_required(ROLES)
async def delete_devices_image(request: Request, image_key: str, user=None):
    response = await afd.delete_image_from_s3(image_key[1:])
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')


@devices.put("/allocate_device", status_code=201)
@auth_required(ROLES)
async def allocate_device_route(request: Request, device: AllocateDevice, user=None):
    response = await afd.allocate_device(request.client.host, device, user)
    if response['status'] == 200:
        return {**response, 'result': 'device {0} allocated to vehicle {1}'.format(device.device_id, device.vehicle_id)}
    else:
        HTTPException(status_code=404, detail='An error occurred while executing transaction')


@devices.put("/deallocate_device", status_code=201)
@auth_required(ROLES)
async def deallocate_device_route(request: Request, device: DeviceId, user=None):
    response = await afd.deallocate_device(request.client.host, device.device_id, user)
    if response['status'] == 200:
        return {'status': 200, 'result': 'device {0} deallocated'.format(device.device_id)}
    else:
        HTTPException(status_code=404, detail='An error occurred while executing transaction')


@devices.put("/update_device", status_code=201)
@auth_required(ROLES)
async def update_device_route(request: Request, device: UpdateDevice, user=None):
    response = await afd.update_device(request.client.host, device, user)
    if response['status'] == 200:
        return {**response}
    else:
        HTTPException(status_code=404, detail='An error occurred while executing transaction')
