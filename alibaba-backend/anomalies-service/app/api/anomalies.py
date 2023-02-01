from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Request, Header, Depends, UploadFile
from fastapi.responses import JSONResponse

from models import Anomaly
from db_manager import anomalies_db as ad
from log import logger
import os

from middlewares import auth_required

anomalies = APIRouter()

super_admin = 'super_admin'
fleet_manager = 'fleet_manager'
ROLES = [fleet_manager]


@anomalies.get("/", status_code=201)
async def index():
    return {'status': 'Success from / of Anomalies'}


@anomalies.post("/add_anomalies", status_code=201)
@auth_required(ROLES)
async def add_anomaly(request: Request, anomaly: Anomaly, user=None):
    response = await ad.add_anomlay(request.client.host, anomaly, user)
    print(response)
    if response['status'] == 200:
        return {**response}
    else:
        HTTPException(status_code=404, detail='An error occurred while executing transaction')


@anomalies.get("/all_unauthorized_vehicles", status_code=201)
@auth_required(ROLES)
async def get_all_unauthorized_vehicles(request: Request, user=None):
    response = await ad.get_anomaly_by_drivers(user)
    print(f"/all_unauthorized_vehicles: {response}")
    return {**response}


@anomalies.get("/get_count_by_drivers", status_code=201)
@auth_required(ROLES)
async def get_all_anomalies_by_drivers(request: Request, user=None):
    response = await ad.get_anomaly_by_drivers(user)
    return {**response}


@anomalies.get("/get_count_by_vehicles", status_code=201)
@auth_required(ROLES)
async def get_all_anomalies_by_vehicles(request: Request, user=None):
    response = await ad.get_anomaly_by_vehicles(user)
    return {**response}


@anomalies.get("/get_count_by_drivers/{anomaly_name}", status_code=201)
@auth_required(ROLES)
async def get_all_anomaly_by_drivers(request: Request, anomaly_name: str, user=None):
    print(anomaly_name)
    if not anomaly_name:
        return {'status': 400, 'detail': "Anomaly Type must be required"}
    response = await ad.view_particular_anomaly_by_drivers(anomaly_name, user)
    return {**response}


@anomalies.get("/get_count_by_vehicles/{anomaly_name}", status_code=201)
@auth_required(ROLES)
async def get_all_anomaly_by_vehicles(request: Request, anomaly_name: str, user=None):
    if not anomaly_name:
        return {'status': 400, 'detail': "Anomaly Type must be required"}
    response = await ad.view_particular_anomaly_by_vehicles(anomaly_name, user)
    return {**response}


@anomalies.get("/online_unauth_vehicles/all", status_code=201)
@auth_required(ROLES)
async def get_all_unauthorized_vehicles(request: Request, user=None):
    response = await ad.get_unauthorized_vehicles_with_details(user)
    return {**response}


@anomalies.get("/online_unath_vehicle/{vehicle_id}", status_code=201)
@auth_required(ROLES)
async def get_single_unauthorized_vehicle(request: Request, vehicle_id: str, user=None):
    response = await ad.get_particular_unauthorized_vehicle_with_details(user, vehicle_id)
    return {**response}

@anomalies.get("/anomalies_by_driver/{driver_id}/{page}/{limit}", status_code=201)
@auth_required(ROLES)
async def get_anomalies_by_driver(request: Request, driver_id: str, page:int, limit:int, user=None):
    response = await ad.get_anomalies_for_single_driver(driver_id, page, limit, user)
    return response

@anomalies.get("/all/{manager_id}/{page}/{limit}", status_code=201)
@auth_required(ROLES)
async def get_all_anomalies(request: Request, page:int, manager_id:str,limit:int, user=None):
    response = await ad.get_all_paginated_anomalies(manager_id, page, limit, user)
    if response is not None:
        return response
    else:
        return JSONResponse(status_code=404, content={"message": "No data available to show"})

@anomalies.post("/create_anomaly_image_url/{image_name}", status_code=201)
@auth_required('super_admin')
async def add_anomaly_image(request: Request, image_name:str, file:UploadFile,  user=None):
    if not file:
        raise HTTPException(status_code=405, detail='No file attached')
 
    response = await ad.upload_anomaly_to_s3(file, image_name)
    return response

@anomalies.get("/get_anomaly_image_url/{image_name}", status_code=201)
@auth_required(ROLES)
async def get_anomaly_image_url(request: Request, image_name:str, user=None):
    aws_image_key = os.getenv("AWS_IMAGE_KEY")
    image_key = f"{aws_image_key}{image_name}"
    response = await ad.get_anomaly_image_url_from_s3(image_key)
    return response
