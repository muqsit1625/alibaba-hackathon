import hashlib
import json
import time
import traceback
from cloud_channel_conn import CloudChannel, cloud_channel_conn
from utils import uuidv6
from fastapi import HTTPException
from typing import Union, Optional
from datetime import datetime, timedelta
from queries import query
from log import logger
from db import db
import psycopg2
import os
import pprint


# ------------------ Fleet Managers Functions--------------------#
class Liveview_Database():

    async def current_auth_and_driver(self, vehicle_plateno, user):

        vehicle_details = await self.get_vehicle_details(vehicle_plateno, user)
        if not vehicle_details:
            raise Exception("No vehicle exists")

        current_auth = await self.get_current_auth_status(vehicle_plateno, user)
        current_driver = await self.get_current_driver(vehicle_details['vehicle_id'], user)

        # print(f"vehicle_details: {vehicle_details}")

        return {'auth_status': current_auth, 'driver': current_driver, 'vehicle': vehicle_details}

    async def get_vehicle_details(self, vehicle_plateno, user):
        vehicle_details = None

        try:
            db.cursor.execute(query.get_vehicle_details(), (vehicle_plateno,))
            vehicle_details = db.cursor.fetchone()
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return vehicle_details

    async def get_current_auth_status(self, vehicle_plateno, user):

        latest_unauth = list(db.m_db['anomalies'].find(
            {'payload.plateNo': vehicle_plateno, 'anomaly_type': 'unauthorized_anomaly'}).sort("sentTime", -1).limit(1))
        latest_auth = list(db.m_db['face_recognition'].find(
            {'payload.plateNo': vehicle_plateno}).sort("sentTime", -1).limit(1))

        if len(latest_auth) < 1:
            return None

        current_auth = latest_auth[0]

        if len(latest_unauth) > 0 and len(latest_auth) > 0:
            pattern = '%Y-%m-%d %H:%M:%S.%f'

            latest_auth_epoch = int(time.mktime(
                time.strptime(latest_auth[0]["sentTime"], pattern)))
            latest_unauth_epoch = int(time.mktime(
                time.strptime(latest_unauth[0]["sentTime"], pattern)))

            if (latest_auth_epoch - latest_unauth_epoch) < 0:
                # if latest_auth time is greater(means more recent with current_time) than latest_unauth then, it means driver is auhorized else unauthorized
                current_auth = latest_unauth[0]
                del current_auth["_id"]
                return {**current_auth, 'status': False}

        del current_auth["_id"]
        return {**current_auth, 'status': True}

    async def get_current_driver(self, vehicle_id, user):

        current_driver = []

        try:
            db.cursor.execute(query.get_all_drivers_of_vehicle(), {
                'vehicle_id': vehicle_id, 'manager_id': user['user_id']})
            current_driver = db.cursor.fetchall()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return current_driver

    async def get_current_location(self, vehicle_plateno):
        location_db = db.m_db['location_packets']
        vehicle_location = list(location_db.find(
            {'payload.plateNo': vehicle_plateno}).sort('sentTime', -1).limit(1))
        if len(vehicle_location) == 0:
            return self.return_response(None)
        del vehicle_location[0]['_id']
        return self.return_response(vehicle_location[0])

    async def get_liveview_details(self, vehicle_plate_no, user):
        curr_auth_and_driver = await self.current_auth_and_driver(vehicle_plate_no, user)

        # print(f"curr_auth_and_driver: {curr_auth_and_driver}")
        # {status, data}
        curr_location = await self.get_current_location(vehicle_plate_no)
        # print(f"curr_location: {curr_location}")
        if curr_location['result'] is None or curr_auth_and_driver['driver'] is None:
            return None

        return {**curr_auth_and_driver, 'location': curr_location['result']}

    async def get_vehicle_status(self, vehicle_plate_no):
        online_db = db.m_db['online_packets']
        is_online_vehicle = list(online_db.find(
            {'vehicleId': vehicle_plate_no}).sort("epoch", -1))

        if len(is_online_vehicle) > 0:
            if time.time() - is_online_vehicle[0]['epoch'] < 30:
                return {'status': "online", **dict(is_online_vehicle)}

        return {'status': 'offline'}

    async def start_liveview_feed(self, number_plate, request_feed, user):
        try:
            manager_id = user['user_id']
            vehicle_details = await self.get_liveview_details(number_plate, user)

            # print(f"vehicle_details: {vehicle_details}")

            msg = "Start" if request_feed == 1 else 'Stop'

            if vehicle_details is not None:
                str2hash = vehicle_details['vehicle']['serial_number'].strip(
                ) + '_videoStream'

                routing_key = hashlib.md5(str2hash.encode())

                routing_key = str(routing_key.hexdigest())

                # print(f"routing_key: {routing_key}, str2hash: {str2hash}")

                try:
                    CloudChannel.queue_declare(queue=routing_key)
                    vehicle_status = await self.get_vehicle_status(number_plate)
                    if vehicle_status['status'].lower() == 'online':
                        CloudChannel.basic_publish(
                            exchange='', routing_key=routing_key, body=msg)
                except (Exception) as error:
                    traceback.print_exc()
                    cloud_channel_conn.reconnect(routing_key, msg)

        except (Exception) as error:
            print("Error in LiveView", error)
            traceback.print_exc()
        return {"vehicle_details": vehicle_details, 'manager_id': manager_id}

    async def stop_liveview(self, number_plate, user):
        try:

            manager_id = user['user_id']
            vehicle_details = self.get_liveview_details(number_plate, user)

            str2hash = records['vehicle']['serial_number'].strip() + \
                       '_videoStream'
            routing_key = hashlib.md5(str2hash.encode())

            try:
                CloudChannel.queue_declare(queue=routing_key)
                CloudChannel.basic_publish(
                    exchange='', routing_key=routing_key, body=msg)
            except (Exception) as error:
                cloud_channel_conn.reconnect(routing_key, msg)

        except (Exception) as error:
            print("Error Stopping Feed", error)
            traceback.print_exc()

        return {"feed": "Stopped"}

    async def return_date_range(self, range_type='daily'):
        days = 1  # for daily
        if range_type == 'weekly':
            days = 7
        elif range_type == 'monthly':
            days = 31

        return [int(time.time() - timedelta(days=days).total_seconds()), int(time.time())]

    async def get_driver_anomalies_count(self, vehicle_plateno, time_range, user):
        vehicle_details = await self.get_vehicle_details(vehicle_plateno, user)
        allocated_drivers = await self.get_current_driver(vehicle_details['vehicle_id'], user)
        # end_time is always now()
        start_time, end_time = await self.return_date_range(time_range)

        anomalies_count = []
        for driver in allocated_drivers:
            driver_anomalies = db.m_db['anomalies'].aggregate([
                {"$match": {"driverId": driver['driver_id'], "anomaly_type": "$anomaly_type", "epoch": {
                    "$gte": start_time, "$lt": end_time}}},
                {'$group': {"_id": "driverId",
                            "count": {"$sum": 1}}}
            ])

            anomalies_count.append(driver_anomalies)

        return self.return_response(anomalies_count)

    async def get_single_driver_anomalies_count(self, driver_id, user):
        distracted_anomalies = list(db.m_db['anomalies'].find(
            filter={"driverId": driver_id, "anomaly_type": "distracted_anomaly"},
            sort=[('sentTime', -1)],
            limit=1))

        drowsy_anomalies = list(db.m_db['anomalies'].find(
            filter={"driverId": driver_id, "anomaly_type": "drowsy_anomaly"},
            sort=[('sentTime', -1)],
            limit=1))

        last_anomaly = list(db.m_db['anomalies'].find(
            filter={"driverId": driver_id},
            sort=[('sentTime', -1)],
            limit=1))

        if len(distracted_anomalies) > 0:
            del distracted_anomalies[0]['_id']

        if len(drowsy_anomalies) > 0:
            del drowsy_anomalies[0]['_id']

        if len(last_anomaly) > 0:
            del last_anomaly[0]['_id']

        return self.return_response({'distracted': distracted_anomalies, 'drowsy': drowsy_anomalies,
                                     "last_anomaly": last_anomaly})

    async def get_vehicle_speed(self, vehicle_plate_no, user):
        location_db = db.m_db['location_packets']
        vehicle_location = list(location_db.find(
            {'payload.plateno': vehicle_plate_no}).sort("epoch", -1))

        if len(vehicle_location) == 0:
            return self.return_response([])
        del vehicle_location[0]['_id']
        return self.return_response(vehicle_location)

    def return_response(self, data):
        try:
            res = {'status': 200, 'result': data}
            return res
        except Exception as e:
            traceback.print_exc()
            print(e)

    def return_exception(self, error):
        logger.error("Exception : {0}".format(str(error)))
        return {'status': 400, 'detail': str(error)}


liveview_db = Liveview_Database()
