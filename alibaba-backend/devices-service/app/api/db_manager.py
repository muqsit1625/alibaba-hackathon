from models import DevicesOut, DevicesIn, AllocateDevice, UpdateDevice
from utils import uuidv6, generate_s3_url, get_image_url, delete_image_url
from fastapi import HTTPException
from typing import Union, Optional
from datetime import datetime
from queries import query
from log import logger
from db import db
import psycopg2
import os


# ------------------ Super Admin Functions--------------------#
class SuperAdminDevices():

    async def get_all_devices(self, client_ip: str):

        all_devices = []

        try:
            db.cursor.execute(query.get_query())
            all_devices = db.cursor.fetchall()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)

        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return all_devices

    async def get_device_by_id(self, device_id):

        single_device = {}

        try:
            db.cursor.execute(query.get_single_device_query(), (device_id,))
            single_device = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)

        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return single_device

    async def get_device_by_serial_number(self, device_serial_number):

        single_device = {}
        print(f"device_serial_number", device_serial_number)
        try:
            db.cursor.execute(
                query.get_single_device_by_serial_query(), (device_serial_number,))
            single_device = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)

        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return single_device

    async def allocate_device(self, client_ip: str, device, user):

        device = self.get_map_from_object({}, device)
        print("device : ", device)
        try:
            db.cursor.execute(query.allocate_device(), device)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor, None)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 400}

    async def deallocate_device(self, client_ip: str, device_id: str, user):
        print(device_id)
        try:
            db.cursor.execute(query.deallocate_device(),
                              (device_id, device_id,))
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor, None)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 400}

    async def delete_device(self, client_ip: str, device_id, user):

        record_id = uuidv6()

        try:
            db.cursor.execute(query.delete_single_query(),
                              (user['user_id'], record_id, device_id,))
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 200}

    async def get_s3image_url(self, image_key: str):

        response = get_image_url(image_key)
        return {'status': 200, 'result': response}

    async def add_image_to_s3url(self, image_key: str):
        response = generate_s3_url(image_key)
        return {'status': 200, 'result': response}

    async def delete_image_from_s3(self, image_key: str):
        response = delete_image_url(image_key)
        return {'status': 200, 'result': response}

    def get_map_from_object(self, map, device):
        map.update(device)
        return map

    def return_response(self, cursor, image_url=None):
        res = {'status': 200, 'result': cursor.rowcount}
        if image_url:
            res['upload_image'] = image_url['result']
        return res

    async def add_new_device(self, client_ip: str, device: DevicesIn, user):
        device_id = uuidv6()

        new_device = self.get_map_from_object({'device_id': device_id}, device)

        try:
            db.cursor.execute(query.add_device_query(), new_device)
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

    async def update_device(self, client_ip: str, device: UpdateDevice, user):

        try:
            db.cursor.execute(query.update_single_query(),
                              self.get_map_from_object({}, device))
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

    def result_to_mongo(self, client_ip, error, user_id, status):
        self.log_to_mongo(client_ip, user_id, db.cursor.query, status)
        if status == 'FAIL':
            self.return_exception(error)

    def return_exception(self, error, status_code=400):
        logger.error("Exception : {0}".format(str(error)))
        raise HTTPException(status_code=status_code, detail=error)

    def log_to_mongo(self, client_ip, user_id, query, status):
        table = db.m_db['logs']
        query = self.get_query(query)
        log = self.mongo_log_object(client_ip, user_id, query, status)
        table.insert_one(log)

    def mongo_log_object(self, client_ip, user_id, query, status):
        return {
            'user_id': user_id,
            'database': os.getenv('PG_DB'),
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


admin_for_devices = SuperAdminDevices()
