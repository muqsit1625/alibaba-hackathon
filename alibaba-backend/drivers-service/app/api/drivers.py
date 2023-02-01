import json
from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from fastapi.responses import JSONResponse
from utils import uuidv6, generate_image_key
from models import DriverIn, DriversList, DriversOut, DriversUpdate, SingleDriver, AssignVehicle, UnAssignVehicle
from db_manager import fleet_manager_drivers as fmd
from log import logger

from middlewares import auth_required

drivers = APIRouter()

super_admin = 'super_admin'
fleet_manager = 'fleet_manager'
ROLES = [fleet_manager]


@drivers.get("/", status_code=201)
async def index():
    return {'status': 'Success from / of drivers'}


@drivers.get("/all", status_code=201)
@auth_required(ROLES)
async def get_all(request: Request, user=None):
    response = await fmd.get_all_drivers(user)
    # response = await fmd.get_all_embeddings(response)
    return {'status': 200, 'result': response}


@drivers.get("/all_driver_name", status_code=201)
@auth_required(ROLES)
async def get_all(request: Request, user=None):
    response = await fmd.get_all_driver_names(user)
    return {'status': 200, 'result': response}


@drivers.get("/all_embeddings", status_code=201)
@auth_required(ROLES)
async def get_all(request: Request, user=None):
    response = await fmd.get_all_drivers(user)
    response = await fmd.get_all_embeddings(response)
    return {'status': 200, 'result': response}


@drivers.get("/embeddings_for_drivers", status_code=201)
@auth_required(ROLES + [super_admin])
async def get_all(request: Request, user=None):
    drivers_data = await request.body()
    print(f"drivers data: {drivers_data}")
    response = await fmd.get_all_embeddings(json.loads(drivers_data))
    return {'status': 200, 'result': response}


@drivers.get("/get_driver/{driver_id}", response_model=SingleDriver, status_code=201)
@auth_required(ROLES)
async def get_driver(request: Request, driver_id: str, user=None):
    response = await fmd.get_single_driver(driver_id, user)
    return {'status': 200, 'result': response}


@drivers.get("/driver_anomalies/{driver_id}", status_code=201)
@auth_required(ROLES)
async def get_driver(request: Request, driver_id: str, user=None):
    response = await fmd.get_single_driver_anomalies(driver_id, user)
    return {'status': 200, 'result': response}


@drivers.post("/add_driver", status_code=201)
@auth_required(ROLES)
async def add_single_driver(request: Request, driver: DriverIn, user=None):
    response, driver = await fmd.add_new_driver(request.client.host, driver, user)
    if response['status'] == 200:
        response = await fmd.create_driver_embeddings(driver)
        if response['status'] == 200:
            return {**response}
    return HTTPException(status_code=404, detail=response['detail'] or 'An error occurred while executing transaction')


@drivers.post("/add_driver_embedding", status_code=201)
@auth_required(ROLES)
async def add_single_driver_embedding(request: Request, driver: DriverIn, user=None):
    response = await fmd.create_driver_embeddings(driver)
    if response['status'] == 200:
        return {**response}
    return HTTPException(status_code=404, detail=response['detail'] or 'An error occurred while executing transaction')


@drivers.get("/create_image_url", status_code=201)
@auth_required(ROLES)
async def add_drivers_image(request: Request, user=None):
    response = await fmd.add_image_to_s3url(uuidv6())
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')


# Use this URL like : http://localhost:8080/api/v1/drivers/get_image//drivers/1ecd8153-ce13-6f08-a3ae-0242ac130005.jpeg
@drivers.get("/get_image/{image_key:path}", status_code=201)
@auth_required(ROLES)
async def get_driver_image(request: Request, image_key: str, user=None):
    response = await fmd.get_s3image_url(image_key[1:])
    if response['status'] == 200:
        return {**response}
    else:
        return HTTPException(status_code=404, detail='An error occurred while executing transaction')


@drivers.delete("/{driver_id}", status_code=201)
@auth_required(ROLES)
async def delete_driver(request: Request, driver_id: str, user=None):
    response = await fmd.delete_single_driver(request.client.host, driver_id, user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404,
                            detail=response['detail'] or 'An error occurred while executing transaction')


@drivers.put("/update_driver", status_code=201)
@auth_required(ROLES)
async def update_driver(request: Request, driver: DriversUpdate, user=None):
    response, driver = await fmd.update_driver(request.client.host, driver, user)
    if response['status'] == 200:
        response = await fmd.create_driver_embeddings(driver)
        if response['status'] == 200:
            return {**response}
    raise HTTPException(status_code=404,
                        detail=response['detail'] or 'An error occurred while executing transaction')


@drivers.patch("/assign_vehicle", status_code=201)
@auth_required(ROLES)
async def assign_vehicle_request(request: Request, data: AssignVehicle, user=None):
    response = await fmd.assign_vehicle(request.client.host, data, user)
    if response['status'] == 200:
        return {**response}
    else:
        HTTPException(status_code=404, detail='An error occurred while executing transaction')


@drivers.patch("/unassign_vehicle", status_code=201)
@auth_required(ROLES)
async def unassign_vehicle_request(request: Request, data: UnAssignVehicle, user=None):
    response = await fmd.unassign_vehicle(request.client.host, data, user)
    if response['status'] == 200:
        return {**response}
    else:
        HTTPException(status_code=404, detail='An error occurred while executing transaction')
