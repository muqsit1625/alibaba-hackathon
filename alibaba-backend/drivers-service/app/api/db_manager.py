import base64
import io

import numpy as np
import requests
from PIL import Image

from embeddingscalculator import EmbeddingsCalculator
from models import DriverIn, DriversList, DriversOut, DriversUpdate, SingleDriver, AssignVehicle, UnAssignVehicle
from utils import uuidv6, generate_s3_url, get_image_url, get_image_array_from_url_via_request, get_object_url, \
    generate_image_and_object_key_from_media_url, generate_s3_url_for_object, generate_image_key, \
    generate_s3_url_from_image
from fastapi import HTTPException
from typing import Union, Optional
from datetime import datetime
from queries import query
from log import logger
from db import db
import psycopg2
import json

import os


# ------------------ Fleet Managers Functions--------------------#
class FleetManagersDriver():

    def __init__(self):
        self.BB = EmbeddingsCalculator()

    async def get_all_drivers(self, user):
        all_drivers = []

        try:
            db.cursor.execute(query.get_query(), (user['user_id'],))
            all_drivers = db.cursor.fetchall()
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            return self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            return self.return_exception(error)

        return all_drivers

    async def get_all_driver_names(self, user):
        all_drivers = []

        try:
            db.cursor.execute(
                query.get_driver_name_and_id_query(), (user['user_id'],))
            all_drivers = db.cursor.fetchall()
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            return self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            return self.return_exception(error)

        return all_drivers

    def fetch_embeddings_from_url(self, presigned_url):
        response = requests.request('GET', url=presigned_url)
        if response.status_code == 200:
            embedding = json.loads(response.content)
            return embedding
        return []

    async def get_all_embeddings(self, drivers):
        for driver in drivers:
            _, object_key = generate_image_and_object_key_from_media_url(
                driver['driver_media_url'])
            object_pre_signed_url = get_object_url(object_key)
            driver['embedding'] = self.fetch_embeddings_from_url(
                object_pre_signed_url['result'])
        return drivers

    async def get_single_driver(self, driver_id: str, user):
        single_driver = {}

        try:
            db.cursor.execute(query.get_single_query(),
                              (driver_id, user['user_id'],))
            single_driver = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            return self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            return self.return_exception(error)
        return single_driver

    async def get_single_driver_anomalies(self, driver_id: str, user):
        driver_anomalies = []

        print(f"driver_id : {driver_id}")

        try:
            anomalies = db.m_db['anomalies']
            driver_anomalies = anomalies.find({'driverId': driver_id})
            driver_anomalies_in_json = await self.get_driver_anomalies_in_dict(driver_anomalies)

        except Exception as error:
            return self.return_exception(error)

        return driver_anomalies_in_json

    async def get_driver_anomalies_in_dict(self, anomalies):
        dict_anomalies = []

        for anomaly in anomalies:
            dict_anomalies.append(json.loads(json.dumps(anomaly, default=str)))

        return dict_anomalies

    def get_map_from_object(self, map, driver):
        map.update(driver)
        return map

    # user is here fleet manager
    async def add_new_driver(self, client_ip: str, driver: DriverIn, user):
        generated_driver_media_url = generate_image_key(uuidv6())
        driver.driver_media_url = generated_driver_media_url
        driver_id = uuidv6()

        new_driver = self.get_map_from_object(
            {'driver_id': driver_id, "manager_id": user['user_id']}, driver)

        try:
            db.cursor.execute(query.add_new_query(), new_driver)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor), driver

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL'), driver
        except (Exception, psycopg2.Error) as error:
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL'), driver
        return {'status': 400}, driver

    async def update_driver(self, client_ip: str, driver: DriversUpdate, user):
        if driver.embedding:
            del driver.embedding
        generated_driver_media_url = generate_image_key(uuidv6())
        driver.driver_media_url = generated_driver_media_url

        updated_driver = self.get_map_from_object(
            {'manager_id': user['user_id']}, driver)
        try:
            db.cursor.execute(query.update_single_query(), updated_driver)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor), driver

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL'), driver
        except (Exception, psycopg2.Error) as error:
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL'), driver
        return {'status': 400}, driver

    def process_image_and_store_embeddings_to_s3(self, img_array, object_key):
        embeddings_array = self.BB.calculate_embedding(img_array)
        object_url = generate_s3_url_for_object(object_key)
        form_data = object_url['result']['fields']
        form_data['file'] = json.dumps(embeddings_array.tolist())
        response = requests.request(
            "POST", 'https://new-autilent.s3.amazonaws.com/', files=form_data)
        return response

    def store_image_to_s3(self, img_bytes, image_key):
        image_url = generate_s3_url_from_image(image_key)
        form_data = image_url['result']['fields']
        form_data['file'] = img_bytes
        response = requests.request(
            "POST", 'https://new-autilent.s3.amazonaws.com/', files=form_data)
        return response

    def get_image_array_from_byte_string(self, image_string):
        img_bytes = base64.b64decode(image_string)
        img_array = np.array(Image.open(io.BytesIO(img_bytes)))
        return img_array, img_bytes

    async def create_driver_embeddings(self, driver: DriverIn):
        media_key_for_driver_image, object_key = generate_image_and_object_key_from_media_url(
            driver.driver_media_url)
        img_array, img_bytes = self.get_image_array_from_byte_string(
            driver.driver_image)
        response_image_upload = self.store_image_to_s3(
            img_bytes, media_key_for_driver_image)
        response_embeddings_upload = self.process_image_and_store_embeddings_to_s3(
            img_array, object_key)
        return {'status': 200, 'image_upload': response_image_upload, 'embeddings_upload': response_embeddings_upload}

    async def get_s3image_url(self, image_key: str):

        response = get_image_url(image_key)
        return {'status': 200, 'result': response}

    async def add_image_to_s3url(self, image_key):
        response = generate_s3_url(image_key)
        return {'status': 200, 'result': response}

    async def delete_single_driver(self, client_ip: str, driver_id: str, user):
        record_id1 = uuidv6()
        admin_id = user['user_id']

        try:
            db.cursor.execute(query.delete_single_query(),
                              (driver_id, record_id1, admin_id))
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 200}

    def is_update_image(self, image):
        return (image is not None) and image != ''

    def return_response(self, cursor, image_url=None):
        res = {'status': 200, 'result': cursor.rowcount}
        if image_url:
            res['upload_image'] = image_url['result']
        return res

    async def update_single_driver(self, client_ip: str, driver: DriversUpdate, user):
        image_url = generate_s3_url(driver.driver_id) if self.is_update_image(
            driver.driver_media_url) else None
        updated_driver = self.get_map_from_object(
            {'manager_id': user['user_id']}, driver)

        try:
            db.cursor.execute(query.update_single_query(), updated_driver)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor, image_url)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 400}

    async def assign_vehicle(self, client_ip: str, data: AssignVehicle, user):

        update_driver = self.get_map_from_object(
            {'manager_id': user['user_id']}, data)

        try:
            db.cursor.execute(query.assign_vehicle_query(), update_driver)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor, None)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 400}

    async def unassign_vehicle(self, client_ip: str, data: UnAssignVehicle, user):

        update_driver = self.get_map_from_object(
            {'manager_id': user['user_id']}, data)

        try:
            db.cursor.execute(query.unassign_vehicle_query(), update_driver)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor, None)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            return self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status': 400}

    def result_to_mongo(self, client_ip, error, user_id, status):
        self.log_to_mongo(client_ip, user_id, db.cursor.query, status)
        if status == 'FAIL':
            return self.return_exception(error)

    def return_exception(self, error):
        logger.error("Exception : {0}".format(str(error)))
        return {'status': 400, 'detail': str(error)}

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


fleet_manager_drivers = FleetManagersDriver()
