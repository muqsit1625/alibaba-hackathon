import traceback

import cv2
import numpy as np
import requests

from models import VehicleOut, VehicleIn, AddOrder, VehicleInfo
from utils import uuidv6, generate_s3_url, get_image_url, delete_image_url, generate_s3_url_for_current_driver, \
    get_image_url_for_current_driver
from fastapi import HTTPException
from datetime import datetime
from queries import query
from log import logger
from db import db
import psycopg2
import json
import time
from datetime import datetime
from time import gmtime, strftime
import os


class SuperAdminForVehicles():

    async def get_all_vehicles(self, client_ip: str, page: int, user):
        all_vehicles = []
        if page > 0:
            page = page-1
        try:
            db.cursor.execute(query.get_query(user), {
                              'user_id': user['user_id'], 'offset': page*10})
            all_vehicles = db.cursor.fetchall()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            print("error 2: ", error)
            self.return_exception(error)
        return all_vehicles

    async def get_online_status(self, manager_id=None):
        print(manager_id)
        vehicle_status_db = db.m_db['vehicle_status']
        vehicle_status_response = {}
        vehicle_status_list = vehicle_status_db.find(
            {}) if not manager_id else vehicle_status_db.find(filter={'managerId': manager_id})
        pattern = '%Y-%m-%d %H:%M:%S.%f'
        for vehicle in vehicle_status_list:
            print(vehicle)
            vehicle_online_status = False
            vehicle_epoch = datetime.strptime(vehicle['last_online'], pattern)
            current_time = datetime.utcnow()
            time_diff = (current_time - vehicle_epoch).total_seconds()
            if time_diff <= 30:
                vehicle_online_status = True

            vehicle_status_response[vehicle['vehicleId']] = {
                'is_online': vehicle_online_status,
                'last_online': vehicle.get('last_online'),
                'latitude': vehicle.get('latitude'),
                'longitude': vehicle.get('longitude'),
                'current_speed': vehicle.get('current_speed'),
                'location': vehicle.get('location'),
                'location_time': vehicle.get('location_time'),
                'vehicle_plate_no': vehicle.get('vehicle_plate_no'),
                'auth_status': vehicle.get('auth_status', 'Unauthorized'),
                'driver_id': vehicle.get('driver_id', '-'),
                'auth_status_time': vehicle.get('auth_status_time')

            }

        return vehicle_status_response

    async def get_single_vehicle_online_status(self, vehicle_id):

        all_vehicle_status = await self.get_online_status()
        print(all_vehicle_status)
        try:
            response = {'is_online': all_vehicle_status[vehicle_id]['is_online'],
                        'last_online': all_vehicle_status[vehicle_id]['last_online']}
        except KeyError:
            response = {
                'is_online': False,
                'last_online': None
            }
        except:
            traceback.print_exc()
        return response

    def insert_online_info_into_vehicles(self, vehicles_list, online_info):
        for vehicle in vehicles_list:
            print(online_info)
            try:
                vehicle['last_online'] = online_info[vehicle['vehicle_id']
                                                     ]['last_online']
                vehicle['is_online'] = online_info[vehicle['vehicle_id']
                                                       ]['is_online']
            except KeyError:
                vehicle['last_online'] = None
                vehicle['is_online'] = False
            except:
                traceback.print_exc()

        return vehicles_list

    def insert_status_info_into_vehicles(self, vehicle_status_list):
        response = []
        for vehicle in vehicle_status_list:
            if vehicle_status_list[vehicle]['latitude']:
                vehicle_status_list[vehicle]['vehicle_id'] = vehicle

                response.append(
                    vehicle_status_list[vehicle]
                )

        return response

    async def get_all_vehicle_license_plate(self, client_ip: str, user):
        all_vehicles = []

        try:
            db.cursor.execute(
                query.get_vehicle_license_plate_query(user), user)
            all_vehicles = db.cursor.fetchall()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            print("error 2: ", error)
            self.return_exception(error)
        return all_vehicles

    async def get_vehicle_by_id(self, client_ip: str, vehicle_id, user):
        single_vehicle = {}

        try:
            db.cursor.execute(query.get_single_vehicle(user), {
                'vehicle_id': vehicle_id, **user})
            single_vehicle = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)

        except (Exception, psycopg2.Error) as error:
            print("error : ", error)
            self.return_exception(error)
        return single_vehicle

    def get_map_from_object(self, map, vehicle):
        map.update(vehicle)
        return map

    async def is_vehicle_exist(self, plateno, user):

        single_vehicle = None
        try:
            db.cursor.execute(query.get_single_vehicle_by_plateno(), {
                'vehicle_plate_no': plateno, **user})
            single_vehicle = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)

        except (Exception, psycopg2.Error) as error:
            print("error : ", error)
            self.return_exception(error)
        return single_vehicle

    async def is_vehicle_exist_by_id(self, vehicle_id, user):

        single_vehicle = {}
        try:
            db.cursor.execute(query.get_single_vehicle_by_id(), {
                'vehicle_id': vehicle_id})
            single_vehicle = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)

        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return single_vehicle

    async def update_vehicle_info_to_current_driver_table(self, vehicle_id, current_key):
        try:
            db.cursor.execute(query.update_to_current_driver_table(),
                              {'vehicle_id': vehicle_id, 'current_key': current_key,
                               'created_at': datetime.utcnow()
                               },
                              )
            db.conn.commit()
            return {'status': 200}
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            traceback.print_exc()
        except (Exception, psycopg2.Error) as error:
            traceback.print_exc()
        return {'status': 400}

    async def add_vehicle_info_to_current_driver_table(self, vehicle_id, current_key):
        try:
            db.cursor.execute(query.add_to_current_driver_table(),
                              {'vehicle_id': vehicle_id, 'current_key': current_key})
            db.conn.commit()
            return {'status': 200}
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            traceback.print_exc()
        except (Exception, psycopg2.Error) as error:
            db.conn.rollback()
            await db.connectDB()
            traceback.print_exc()
        return {'status': 400}

    def store_image_to_s3(self, img_bytes, image_key):
        image_url, image_key = generate_s3_url_for_current_driver(image_key)
        form_data = image_url['result']['fields']
        form_data['file'] = img_bytes
        response = requests.request(
            "POST", 'https://new-autilent.s3.amazonaws.com/', files=form_data)
        return response, image_key

    async def update_current_driver_info(self, vehicle_id, file, user):
        # img = np.fromstring(file, np.uint8)
        # img = cv2.imdecode(img, cv2.IMREAD_ANYCOLOR)

        img_key = uuidv6()
        response_s3, image_key = self.store_image_to_s3(file, img_key)
        response_db = await self.update_vehicle_info_to_current_driver_table(vehicle_id, image_key)

        return {"s3": response_s3, "db": response_db}

    async def get_image_key_for_current_driver(self, image_key):
        try:
            db.cursor.execute(query.get_from_current_driver_table(), {
                "vehicle_id": image_key})
            results = db.cursor.fetchall()
            return {'status': 200, 'response': results}
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
        except (Exception, psycopg2.Error) as error:
            db.conn.rollback()
            await db.connectDB()
        return {'status': 400}

    async def get_current_driver_info(self, vehicle_id, user):
        current_response = await self.get_image_key_for_current_driver(vehicle_id)
        if len(list(current_response['response'])):
            current_key = current_response['response'][0]['current_key']
            url = get_image_url_for_current_driver(current_key)
            return {"status": 200, 'response': url}
        return {"status": 400}

    async def get_last_online_time_for_vehicle(self, vehicle_id):
        online_packet_db = db.m_db['online_packets']
        vehicle_online_packet = list(online_packet_db.find(
            {"vehicleId": vehicle_id}, sort=[("sentTime", -1)], limit=1))
        if len(vehicle_online_packet):
            del vehicle_online_packet[0]['_id']
            return vehicle_online_packet[0]
        return None

    async def add_new_vehicle(self, client_ip: str, vehicle: VehicleIn, user):
        vehicle_id = uuidv6()

        if await self.is_vehicle_exist(vehicle.vehicle_plate_no, user):
            raise Exception("Vehicle is already added")

        new_vehicle = self.get_map_from_object(
            {'vehicle_id': vehicle_id}, vehicle)

        try:
            db.cursor.execute(query.add_new_query(), new_vehicle)
            db.conn.commit()
            _ = await self.add_vehicle_info_to_current_driver_table(vehicle_id, "-")
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 400}

    async def update_new_vehicle(self, client_ip: str, vehicle: dict, user):

        if not await self.is_vehicle_exist_by_id(vehicle['vehicle_id'], user):
            raise Exception("Vehicle doesn't exist")

        new_vehicle = self.get_map_from_object({}, vehicle)

        try:
            db.cursor.execute(query.update_vehicle(user),
                              {**new_vehicle, **user})
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 400}

    def return_response(self, cursor, image_url=None):
        res = {'status': 200, 'result': cursor.rowcount}
        if image_url:
            res['upload_image'] = image_url['result']
        return res

    async def delete_vehicle(self, client_ip: str, vehicle_id: str, user):

        record_id = uuidv6()

        try:
            db.cursor.execute(query.delete_single_query(),
                              (vehicle_id, record_id))
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 200, 'message': "Vehicle is deleted successfully"}

    async def get_s3image_url(self, image_key: str):
        response = get_image_url(image_key)
        return {'status': 200, 'result': response}

    async def add_image_to_s3url(self, image_key):
        response = generate_s3_url(image_key)
        return {'status': 200, 'result': response}

    async def delete_image_from_s3(self, image_key: str):
        response = delete_image_url(image_key)
        return {'status': 200, 'result': response}

    async def add_new_order_req(self, client_ip: str, order: AddOrder, user):

        order_id = uuidv6()
        order_data = json.dumps(order.__dict__)
        new_order = {'order_id': order_id, 'order_data': order_data,
                     "manager_id": user['user_id'], "request_type": 'add'}

        try:
            db.cursor.execute(query.add_new_order(), new_order)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor, None)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            print("error")
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')

        return {'status': 400}

    async def delete_vehicle_order_req(self, client_ip: str, vehicle_id: str, user):

        order_id = uuidv6()
        order_data = json.dumps({'vehicle_id': vehicle_id})
        new_order = {'order_id': order_id, 'order_data': order_data,
                     "manager_id": user['user_id'], "request_type": 'delete'}

        try:
            db.cursor.execute(query.add_delete_vehicle_order(), new_order)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 200}

    async def get_vehicles_with_locations(self, client_ip: str, user):
        all_vehicles = []

        try:
            db.cursor.execute(
                query.get_vehicle_license_plate_query(user), user)
            all_vehicles = db.cursor.fetchall()
            online_status = await self.get_online_status(user['user_id'])

            all_vehicles_with_location = self.insert_status_info_into_vehicles(
                online_status)
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return all_vehicles_with_location

    def result_to_mongo(self, client_ip, error, user_id, status):
        self.log_to_mongo(client_ip, user_id, db.cursor.query, status)
        if status == 'FAIL':
            self.return_exception(error)

    def return_exception(self, error, status_code=400):
        logger.error("Exception : {0}".format(str(error)))
        HTTPException(status_code=status_code, detail=error)

    def log_to_mongo(self, client_ip, user_id, query, status):
        table = db.m_db['logs']
        query = self.get_query(query)
        log = self.mongo_log_object(client_ip, user_id, query, status)
        table.insert_one(log)

    def mongo_log_object(self, client_ip, user_id, query, status):
        return {
            'user_id': user_id,
            'database': os.getenv("PG_DB"),
            'statement': query,
            'status': status,
            'created_at': datetime.now(),
            'client_ip': client_ip,
        }

    def get_query(self, query):
        string = self.convert_binary_to_string(query)
        return self.remove_long_whitespaces(string)

    def convert_binary_to_string(self, query):
        return query.decode('utf-8')

    def remove_long_whitespaces(self, string):
        return " ".join(string.split())


admin_for_vehicles = SuperAdminForVehicles()
