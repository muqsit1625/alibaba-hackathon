from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from fastapi.responses import JSONResponse
import traceback
from models import Anomaly, Trip
from db_manager import reports_db as rd
from log import logger
import datetime

from middlewares import auth_required

reports = APIRouter()

super_admin = 'super_admin'
fleet_manager = 'fleet_manager'
ROLES = [fleet_manager]
ELEVATED_ROLES = [super_admin, fleet_manager]


@reports.get("/", status_code=201)
async def index():
    return {'status': 'Success from / of reports'}


@reports.get("/vehicle_reports/{vehicle_id}/{start_date}/{end_date}", status_code=201)
@auth_required(ROLES)
async def get_(request: Request, vehicle_id: str, start_date: str, end_date: str, user=None):
    if not vehicle_id:
        return {'status': 400, 'detail': "Vehicle ID must be required"}
    try:
        response = await rd.generate_vehicle_location_report(vehicle_id, start_date, end_date, user)
        return {**response}

    except Exception as e:
        print(e)
        traceback.print_exc()
        # raise ValueError("Incorrect data format, should be YYYY-MM-DD")
        return {'status': 400, 'detail': f"{e}"}


@reports.get("/vehicle_reports_by_session/{vehicle_id}/{start_date}/{end_date}", status_code=201)
@auth_required(ROLES)
async def get_(request: Request, vehicle_id: str, start_date: str, end_date: str, user=None):
    if not vehicle_id:
        return {'status': 400, 'detail': "Vehicle ID must be required"}
    try:
        response = await rd.generate_vehicle_location_report_by_session(vehicle_id, start_date, end_date, user)
        return {**response}

    except Exception as e:
        print(e)
        traceback.print_exc()
        # raise ValueError("Incorrect data format, should be YYYY-MM-DD")
        return {'status': 400, 'detail': f"{e}"}


@reports.get("/driver_reports/{driver_id}/{start_date}/{end_date}", status_code=201)
@auth_required(ROLES)
async def get_(request: Request, driver_id: str, start_date: str, end_date: str, user=None):
    if not driver_id:
        return {'status': 400, 'detail': "Driver ID must be required"}

    try:
        response = await rd.generate_driver_anomalies_report(driver_id, start_date, end_date, user)
        return {**response}

    except ValueError:
        traceback.print_exc()
        # raise ValueError("Incorrect data format, should be YYYY-MM-DD")
        return {'status': 400, 'detail': "start date and end date must be required"}


@reports.get("/driver_reports_by_session/{driver_id}/{start_date}/{end_date}", status_code=201)
@auth_required(ROLES)
async def get_(request: Request, driver_id: str, start_date: str, end_date: str, user=None):
    if not driver_id:
        return {'status': 400, 'detail': "Driver ID must be required"}

    try:
        print(f"{start_date} {end_date}")
        response = await rd.generate_driver_anomalies_report_by_session(driver_id, start_date, end_date, user)
        return {**response}

    except ValueError:
        traceback.print_exc()
        # raise ValueError("Incorrect data format, should be YYYY-MM-DD")
        return {'status': 400, 'detail': "start date and end date must be required"}


@reports.get("/vehicle_reports_by_trip/{vehicle_id}/{start_date}/{end_date}", status_code=201)
@auth_required(ROLES)
async def get_(request: Request, vehicle_id: str, start_date: str, end_date: str, user=None):
    if not vehicle_id:
        return {'status': 400, 'detail': "Vehicle ID is required"}

    try:
        print(f"{start_date} {end_date}")
        response = await rd.generate_vehicle_anomaly_report_by_trip(vehicle_id, start_date, end_date, user)
        return response

    except Exception as e:
        logger.error(e)
        traceback.print_exc()
        # raise ValueError("Incorrect data format, should be YYYY-MM-DD")
        return {'status': 400, 'detail': "start date and end date must be required"}


@reports.get("/vehicle_reports_v2/{vehicle_id}/{start_date}/{end_date}", status_code=201)
@auth_required(ROLES)
async def get_(request: Request, vehicle_id: str, start_date: str, end_date: str, user=None):
    if not vehicle_id:
        return {'status': 400, 'detail': "Vehicle ID is required"}

    try:
        print(f"{start_date} {end_date}")
        response = await rd.calculate_vehicle_report_data(vehicle_id, start_date, end_date, user)
        return response

    except Exception as e:
        logger.error(e)
        traceback.print_exc()
        # raise ValueError("Incorrect data format, should be YYYY-MM-DD")
        return {'status': 400, 'detail': "start date and end date must be required"}


@reports.post("/trip", status_code=201)
@auth_required(ROLES)
async def get_(request: Request, trip: Trip, user=None):
    if not trip:
        return {'status': 400, 'detail': "Missing Trip information"}

    try:
        response = await rd.start_or_stop_trip_and_send_to_device(trip, user, client_ip=request.client.host)
        return response

    except Exception as e:
        traceback.print_exc()
        return {'status': 400, 'detail': f"{e}"}


@reports.get("/get_active_tripid/{vehicle_id}", status_code=201)
@auth_required(ELEVATED_ROLES)
async def get_(request: Request, vehicle_id: str, user=None):
    if not vehicle_id:
        return {'status': 400, 'detail': "Vehicle ID is required"}
    try:
        response = await rd.get_active_trip_details(vehicle_id)
        if response:

            return response
        else:
            return JSONResponse(status_code=200, content={
                'ongoing': False,
                'trip_id': None
            })
    except Exception as e:
        traceback.print_exc()
        return {'status': 400, 'detail': f"{e}"}
