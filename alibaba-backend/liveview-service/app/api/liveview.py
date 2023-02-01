from fastapi import APIRouter, HTTPException, Request, Depends

from log import logger

from middlewares import auth_required
from db_manager import liveview_db as lvd
from cloud_channel_conn import cloud_channel_conn

liveview = APIRouter()

# super_admin  = 'super_admin'
fleet_manager = 'fleet_manager'
ROLES = [fleet_manager]

cloud_channel_conn.connect()


@liveview.get("/", status_code=201)
async def index():
    return {'status': 'Success from / of Live-View'}


@liveview.get("/current_auth_and_driver/{number_plate}")
@auth_required(ROLES)
async def get_current_auth_and_driver(request: Request, number_plate: str, user=None):
    response = await lvd.current_auth_and_driver(number_plate, user)

    return {**response}


@liveview.get("/current_location/{number_plate}")
@auth_required(ROLES)
async def get_current_location(request: Request, number_plate: str, user=None):
    response = await lvd.get_current_location(number_plate)
    return {**response}


@liveview.get("/request_videofeed/{number_plate}/{request_feed}")
@auth_required(ROLES)
async def get_live_view(request: Request, number_plate: str, request_feed: int, user=None):
    # print("Hello here")
    return await lvd.start_liveview_feed(number_plate, request_feed, user)


@liveview.get("/stop/{number_plate}")
@auth_required(ROLES)
async def stop_liveview(request: Request, number_plate: str, user=None):

    return await lvd.stop_liveview(number_plate, user)


@liveview.get("/vehicle_current_status/{number_plate}")
@auth_required(ROLES)
async def get_vehicle_current_status(request: Request, number_plate: str, user=None):
    response = await lvd.get_vehicle_status(number_plate)
    # response = {'test': 'test'}
    return {**response}


@liveview.get("/allocated_drivers/{number_plate}")
@auth_required(ROLES)
async def get_allocated_drivers(request: Request, number_plate: str, user=None):
    vehicle_details = await lvd.get_vehicle_details(number_plate, user)
    allocated_drivers = await lvd.get_current_driver(vehicle_details['vehicle_id'], user)

    return allocated_drivers


@liveview.get("/drivers_anomalies/{number_plate}/{time_range}")
@auth_required(ROLES)
async def get_drivers_anomalies(request: Request, number_plate: str, time_range: str, user=None):
    response = await lvd.get_driver_anomalies_count(number_plate, time_range, user)
    return {**response}


@liveview.get("/drivers_anomalies_count/{driver_id}")
@auth_required(ROLES)
async def get_drivers_anomalies(request: Request, driver_id: str, user=None):
    response = await lvd.get_single_driver_anomalies_count(driver_id, user)
    return {**response}


@liveview.get("/vehicle_speed/{number_plate}")
@auth_required(ROLES)
async def get_vehicle_speed(request: Request, number_plate: str, user=None):
    response = await lvd.get_vehicle_speed(number_plate, user)
    return {**response}
