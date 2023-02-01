from models import Anomaly
from queries import query
from log import logger
from db import db
import psycopg2
import time
import requests
import traceback
from utils import generate_s3_url, get_image_url


#------------------ Fleet Managers Functions--------------------#
class Anomalies_database():

    # for db random data
    async def add_anomlay(self, client_ip, anomaly: Anomaly, user):
        new_anomaly = ""

        try:
            new_anomaly = str(db.m_db['anomalies'].insert_one(
                self.get_map_from_object({}, anomaly)).inserted_id)
        except (Exception) as error:
            return self.return_exception(error)

        return self.return_response(new_anomaly)

    # For Drivers -----------------------------------------------------------------------------------------------------
    async def get_all_drivers_of_manager(self, user):
        managers_all_drivers = []

        try:
            db.cursor.execute(query.get_all_drivers_of_manager(), user)
            managers_all_drivers = db.cursor.fetchall()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return managers_all_drivers

    def add_drivers_anomalies_in_set(self, all_drivers):
        drivers_ids_of_manager = set()

        for driver in all_drivers:
            drivers_ids_of_manager.add(driver['driver_id'])

        return drivers_ids_of_manager

    async def grouped_drivers_with_anomalies(self):
        try:
            all_anomalies = (db.m_db['anomalies'].aggregate([
                {'$group': {"_id": {"driverId": "$driverId",
                                    "anomaly_type": "$anomaly_type"}, "count": {"$sum": 1}}},
                {'$sort': {'sentTime': -1}},
                {'$limit': 1000}
            ]))

            return all_anomalies

        except (Exception) as error:
            return self.return_exception(error)

    async def get_anomaly_by_drivers(self, user):
        managers_all_drivers = await self.get_all_drivers_of_manager(user)
        print(f"managers_all_drivers: {managers_all_drivers}")
        unique_drivers = self.add_drivers_anomalies_in_set(
            managers_all_drivers)
        print(f"unique_drivers: {unique_drivers}")
        anomalies_with_drivers = await self.grouped_drivers_with_anomalies()
        print(f"anomalies_with_drivers: {anomalies_with_drivers}")
        result = []
        for anomaly in anomalies_with_drivers:
            if ('driverId' in anomaly['_id']) and (anomaly['_id']['driverId'] in unique_drivers):
                result.append(anomaly)

        return self.return_response(result)

    # For Vehicles -----------------------------------------------------------------------------------------------------

    async def get_all_vehicles_of_manager(self, user):
        managers_all_vehicles = []

        try:
            db.cursor.execute(query.get_all_vehicles_of_manager(), user)
            managers_all_vehicles = db.cursor.fetchall()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return managers_all_vehicles

    def add_vehicles_anomalies_in_set(self, all_vehicles):
        vehicle_ids_of_manager = set()

        for vehicle in all_vehicles:
            vehicle_ids_of_manager.add(vehicle['vehicle_id'])

        return vehicle_ids_of_manager

    async def grouped_vehicles_with_anomalies(self):
        try:
            all_anomalies = db.m_db['anomalies'].aggregate([
                {'$group': {"_id": {"vehicleId": "$vehicleId",
                                    "anomaly_type": "$anomaly_type"}, "count": {"$sum": 1}}}
            ]).sort('sentTime', -1)
            return all_anomalies

        except (Exception) as error:
            return self.return_exception(error)

    async def get_anomaly_by_vehicles(self, user):
        managers_all_vehicles = await self.get_all_vehicles_of_manager(user)
        unique_vehicles = self.add_vehicles_anomalies_in_set(
            managers_all_vehicles)
        anomalies_with_vehicles = await self.grouped_vehicles_with_anomalies()

        result = []
        for anomaly in anomalies_with_vehicles:
            if anomaly['_id']['vehicleId'] in unique_vehicles:
                result.append(anomaly)

        return self.return_response(result)

    # Filtered Anomalies
    
    def add_driver_names_and_id_in_dict(self, all_drivers):
        drivers_ids_of_manager = {
            '-':'Unauthorized Driver',
            '-\n':'Unauthorized Driver'
        }
        for driver in all_drivers:
            drivers_ids_of_manager[driver['driver_id']] = driver['driver_first_name'] + ' ' +  driver['driver_last_name']
        return drivers_ids_of_manager

    async def get_driver_names_for_manager(self, paginated_anomalies, user):
        managers_all_drivers = await self.get_all_drivers_of_manager(user)
        unique_drivers = self.add_driver_names_and_id_in_dict(
            managers_all_drivers)
        if paginated_anomalies['metadata'][0]['stop'] > paginated_anomalies['metadata'][0]['total']:
            paginated_anomalies['metadata'][0]['stop'] = paginated_anomalies['metadata'][0]['total']
        for item in paginated_anomalies['data']:
            try:
                item['driver_name'] = unique_drivers[item['driverId']] 
            except Exception as e:
                item['driver_name'] = 'Driver Deleted'
        return {
            'metadata':paginated_anomalies['metadata'][0],
            'data': paginated_anomalies['data']
        }

    async def get_anomalies_for_single_driver(self, driver_id: str, offset, limit, user):
        driver_anomalies = []
        skip = offset * limit
        try:
            anomalies = db.m_db['anomalies']
            driver_anomalies = list(anomalies.aggregate([
                { '$match'    : { "driverId" : driver_id }},
                { '$sort'     : { "sentTime" : -1 } },
                { '$project'  : { "_id": 0 } } ,
                { '$facet'    : { 'metadata': [{ '$count' :"total"}, {'$addFields': {'current_page': offset}}],
                                  'data': [ { '$skip': skip }, { '$limit': limit } ]}}
            ] ))
        except Exception as error:
            return self.return_exception(error)
        
        return driver_anomalies[0]
    
    async def get_all_paginated_anomalies(self, manager_id, offset, limit, user):
        driver_anomalies = []
        skip = offset * limit
        try:
            anomalies = db.m_db['anomalies']
            driver_anomalies = list(anomalies.aggregate([
                { '$match'    : { "payload.managerId": manager_id }},
                { '$sort'     : { "sentTime" : -1 } },
                { '$project'  : { "_id": 0 } } ,
                { '$facet'    : { 'metadata': [{ '$count' :"total"}, {'$addFields': {'current_page': offset}}, 
                                    {'$addFields': {'start': skip}}, {'$addFields': {'stop': (limit*(offset+1)-1)}}],
                                  'data': [ { '$skip': skip }, { '$limit': limit } ]}}
            ] ))
        except Exception as error:
            return self.return_exception(error)
        if(len(driver_anomalies[0]['data'])>0):
            paginated_anomalies = await self.get_driver_names_for_manager(driver_anomalies[0], user)
        else:
            paginated_anomalies = None 
        return paginated_anomalies

    async def grouped_drivers_with_anomaly_name(self, anomaly_name):

        try:
            all_anomalies = db.m_db['anomalies'].aggregate([
                {'$group': {"_id": {"driverId": "$driverId",
                                    "anomaly_type": "$anomaly_type"}, "count": {"$sum": 1}}},
                {"$match": {"_id.anomaly_type": anomaly_name}}
            ]).sort('sentTime', -1)
            return all_anomalies

        except (Exception) as error:
            return self.return_exception(error)

    async def view_particular_anomaly_by_drivers(self, anomaly_name, user):
        managers_all_drivers = await self.get_all_drivers_of_manager(user)
        unique_drivers = self.add_drivers_anomalies_in_set(
            managers_all_drivers)
        anomaly_with_drivers = await self.grouped_drivers_with_anomaly_name(anomaly_name)

        result = []
        for anomaly in anomaly_with_drivers:
            if anomaly['_id']['driverId'] in unique_drivers:
                result.append(anomaly)

        return self.return_response(result)

    async def grouped_vehicles_with_anomaly_name(self, anomaly_name):
        try:
            all_anomalies = db.m_db['anomalies'].aggregate([
                {'$group': {"_id": {"vehicle_id": "$vehicle_id",
                                    "anomaly_type": "$anomaly_type"}, "count": {"$sum": 1}}},
                {"$match": {"_id.anomaly_type": anomaly_name}}
            ]).sort('sentTime', -1)

            return all_anomalies

        except (Exception) as error:
            return self.return_exception(error)

    async def view_particular_anomaly_by_vehicles(self, anomaly_name, user):
        managers_all_vehicles = await self.get_all_vehicles_of_manager(user)
        unique_vehicles = self.add_vehicles_anomalies_in_set(
            managers_all_vehicles)
        anomaly_with_vehicles = await self.grouped_vehicles_with_anomaly_name(anomaly_name)

        result = []
        for anomaly in anomaly_with_vehicles:
            if anomaly['_id']['vehicle_id'] in unique_vehicles:
                result.append(anomaly)

        return self.return_response(result)
    
    async def upload_anomaly_to_s3(self, image_file, image_name):
        try:
            response = generate_s3_url(image_name)
            result = response['result']
            print(result)
            if result['url']:
                filename = image_file.filename
                file = await image_file.read()
                response = requests.post(result['url'], data=result['fields'], files={'file':(filename,file)})
                return {'status': 200, 'result': response}
        except Exception as e:
            logger.error(e)
            traceback.print_exc()
            return {'status': 401, 'result': e}
        
    async def get_anomaly_image_url_from_s3(self, image_key):
        response = get_image_url(image_key)
        return response


    async def get_online_vehicles(self):
        online_db = db.m_db['online_packets']
        all_vehicles = list(online_db.find({}).sort("sentTime", -1))

        unique_vehicles = set()
        all_online_vehicles = set()

        for vehicle in all_vehicles:
            if vehicle['vehicleId'] not in unique_vehicles:
                pattern = '%Y-%m-%d %H:%M:%S.%f'
                vehcleEpoch = int(time.mktime(
                    time.strptime(vehicle['sentTime'], pattern)))

                if time.time() - vehcleEpoch < 30:
                    all_online_vehicles.add(vehicle['vehicleId'])

            unique_vehicles.add(vehicle['vehicleId'])

        return all_online_vehicles

    # View all unauthorised Vehicle

    async def get_online_unauthorized_vehicle(self):

        all_online_vehicle = await self.get_online_vehicles()
        all_unauthorized_vehicle = list(db.m_db['anomalies'].find(
            {'anomaly_type': 'unauthorized_anomaly'}).sort("sentTime", -1))

        unique_unauthorized = set()

        all_current_online_vehicles = []
        for unauthorized in all_unauthorized_vehicle:
            # vehicle comes for first time (to retrieve latest info) AND vehicle is online
            if unauthorized['vehicleId'] not in unique_unauthorized and unauthorized['vehicleId'] in all_online_vehicle:
                all_current_online_vehicles.append(unauthorized['vehicleId'])

            unique_unauthorized.add(unauthorized['vehicleId'])

        return all_current_online_vehicles

    # Reduce time to traverse array again and again
    async def get_hashmap_from_array(self, key, array):
        hashmap = {}
        for value in array:
            hashmap[value[key]] = value
        return hashmap

    async def all_vehicles_with_details(self, all_vehicles, online_unauth_vehicles, drivers_hashset):
        response = []

        for vehicle in all_vehicles:
            # if vehicle is online and have unauthorized driver
            if vehicle['vehicle_id'] in online_unauth_vehicles:
                response.append(
                    {**vehicle, **drivers_hashset[vehicle['vehicle_id']]})

        return response

    # from postgres

    async def get_unauthorized_vehicles_with_details(self, user):

        all_online_unauthorized_vehicles = await self.get_online_unauthorized_vehicle()       # set
        # with details
        managers_all_vehicles = await self.get_all_vehicles_of_manager(user)
        managers_all_drivers = await self.get_all_drivers_of_manager(user)

        drivers_hashset = await self.get_hashmap_from_array(
            'vehicle_id', managers_all_drivers)

        return await self.all_vehicles_with_details(managers_all_vehicles, all_online_unauthorized_vehicles, drivers_hashset)

    async def vehicle_with_details(self, all_vehicles, online_unauth_vehicles, drivers_hashset, vehicle_id):
        response = []

        for vehicle in all_vehicles:
            # if vehicle is online and have unauthorized driver
            if vehicle['vehicle_id'] == vehicle_id and vehicle['vehicle_id'] in online_unauth_vehicles:
                response.append(
                    {**vehicle, **drivers_hashset[vehicle['vehicle_id']]})

        return response

    # from postgres

    async def get_particular_unauthorized_vehicle_with_details(self, user, vehicle_id):
        all_online_unauthorized_vehicles = self.get_online_unauthorized_vehicle()       # set
        # with details
        managers_all_vehicles = self.get_all_vehicles_of_manager(user)
        managers_all_drivers = self.get_all_drivers_of_manager(user)

        drivers_hashset = self.get_hashmap_from_array(
            'vehicle_id', managers_all_drivers)

        return self.vehicle_with_details(managers_all_vehicles, all_online_unauthorized_vehicles, drivers_hashset, vehicle_id)

    def get_map_from_object(self, map, anomaly):
        map.update(anomaly)
        return map

    def return_response(self, data):
        res = {'status': 200, 'result': data}
        return res

    def return_exception(self, error):
        logger.error("Exception : {0}".format(str(error)))
        return {'status': 400, 'detail': str(error)}


anomalies_db = Anomalies_database()
