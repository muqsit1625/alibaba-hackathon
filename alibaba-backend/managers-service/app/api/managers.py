from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from fastapi.responses import JSONResponse

from models import ManagersIn, ManagersOut, ManagersList, SingleManager, ManagersUpdate
from db_manager import admin_for_managers as afm
from log import logger
from utils import uuidv6

import os
from middlewares import auth_required

managers = APIRouter()
ROLES = ['super_admin']


@managers.get("/",status_code=201)
async def index():
    return {'status' : 'Success from / of managers'}


@managers.get("/count_data",status_code=201)
@auth_required(ROLES)
async def count_data_super_admins(request : Request, user = None):
    response = await afm.get_count_data()
    return {'status' : 200, 'result' : response}


@managers.get("/all",  status_code=201)
@auth_required(ROLES)
async def get_all(request: Request, user = None):
    response = await afm.get_all_managers(request.client.host)
    return {'status' : 200, 'result' : response}



@managers.get("/create_image_url/{no_of_urls}", status_code=201)
@auth_required(ROLES)
async def add_managers_image(request: Request, no_of_urls : int,  user = None):
    if no_of_urls is None:
        raise HTTPException(status_code=404, detail='No of URLs are required')

    response = [await afm.add_image_to_s3url(uuidv6()) for _ in range(no_of_urls)]
    return {'status' : 200, 'response' : response}
    



@managers.get("/{manager_id}", response_model = SingleManager, status_code=201)
@auth_required(ROLES)
async def get_manager(request: Request, manager_id : str, user = None):
    response = await afm.get_single_manager(request.client.host, manager_id)
    return {'status' : 200, 'result' : response}




@managers.post("/add_manager", status_code=201)
@auth_required(ROLES)
async def add_single_manager(request: Request, manager : ManagersIn, user = None):
    response = await afm.add_new_manager(request.client.host, manager, user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')
        




# Use this URL like : http://localhost:8080/api/v1/managers/get_image//managers/1ecd8153-ce13-6f08-a3ae-0242ac130005.jpeg
@managers.get("/get_image/{image_key:path}", status_code=201)
@auth_required(ROLES + ['fleet_manager'])
async def get_manager_image(request: Request, image_key : str, user = None):

    response = await afm.get_s3image_url(image_key[1:])
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')



@managers.delete("/{manager_id}", status_code=201)
@auth_required(ROLES)
async def delete_manager(request: Request, manager_id : str, user = None):
    response = await afm.delete_single_manager(request.client.host, manager_id, user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')



@managers.put("/update_image_url/{image_key:path}", status_code=201)
@auth_required(ROLES)
async def update_managers_image(request: Request, image_key : str, user = None):
    start = len(os.getenv("AWS_IMAGE_KEY"))
    image_uuid = image_key[start + 1: start + 37]
    response = await afm.add_image_to_s3url(image_uuid)
    
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')




@managers.delete("/delete_image/{image_key:path}", status_code=201)
@auth_required(ROLES)
async def delete_managers_image(request: Request, image_key : str, user = None):
    response = await afm.delete_image_from_s3(image_key[1:])
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')



@managers.put("/update_manager", status_code=201)
@auth_required(ROLES)
async def update_manager(request: Request, manager : ManagersUpdate, user = None):
    response = await afm.update_single_manager(request.client.host, manager, user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')

@managers.post("/warehouse/update", status_code=201)
@auth_required(ROLES + ['fleet_manager'])
async def update_warehouse_location(request: Request,  user = None):
    data = await request.json()
    response = await afm.update_warehouse_location(request.client.host, data['longitude'], data['latitude'] , user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')

@managers.get("/get_warehouse/{manager_id}", status_code=201)
@auth_required(ROLES + ['fleet_manager'])
async def fetch_warehouse_location(request: Request, manager_id : str, user = None):
    response = await afm.get_warehouse_location(request.client.host, manager_id)
    if response:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')
