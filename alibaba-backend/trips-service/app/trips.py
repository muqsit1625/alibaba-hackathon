from typing import List
from db import db
from queries import query
from log import logger
import os
import psycopg2
from datetime import datetime
from itertools import groupby
from operator import itemgetter
import traceback
import time
import asyncio

class Trips():

    def __init__(self):

        try:
             asyncio.run(self.perpetual_trip_update())
        except Exception as e:
            logger.error(e)
            traceback.print_exc()
            

    async def perpetual_trip_update(self):
        await db.connectDB() 
        while True:
            logger.info("Checking for new Trips.................")
            trips = await self.get_active_trip_details()
            if trips:
                for trip in trips:
                    await self.update_packets_with_trip_id(trip['vehicle_id'],trip['trip_id'], str(trip['trip_start']), str(trip['trip_end']))
            time.sleep(100)


    async def get_active_trip_details(self):
        trip_detail = None
        try:
            db.cursor.execute(query.get_last_completed_trip())
            trip_detail = db.cursor.fetchall()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return trip_detail

    async def update_online_packets_for_trip(self, trip_id, vehicle_id, start_time, end_time):
        print(vehicle_id,start_time, end_time)
        online_packet_db = db.m_db['online_packets']
        vehicle_online = online_packet_db.update_many({
            'vehicleId': vehicle_id,
            'sentTime': {'$gte': start_time, '$lt': end_time}}, {"$set": {"tripId": trip_id}})
                                                      
        return vehicle_online

    async def update_anomaly_packets_for_trip(self, trip_id, vehicle_id, start_time, end_time):
        anomaly_packet_db = db.m_db['anomalies']
        vehicle_anomalies = anomaly_packet_db.update_many({
            'vehicleId': vehicle_id,
            'sentTime': {'$gte': start_time, '$lt': end_time}}, {"$set": {"tripId": trip_id}})
                                                      
        return vehicle_anomalies

    async def update_gps_packets_for_trip(self, trip_id, vehicle_id, start_time, end_time):
        location_packet_db = db.m_db['location_packets']
        vehicle_location = location_packet_db.update_many({
            'vehicleId': vehicle_id,
            'sentTime': {'$gte': start_time, '$lt': end_time}}, {"$set": {"tripId": trip_id}})
        return vehicle_location

    async def update_face_recog_packets_for_trip(self, trip_id, vehicle_id, start_time, end_time):
        face_recog_packet_db = db.m_db['face_recognition']
        vehicle_face_recog = face_recog_packet_db.update_many({
            'vehicleId': vehicle_id,
            'sentTime': {'$gte': start_time, '$lt': end_time}}, {"$set": {"tripId": trip_id}})
                                                      
        return vehicle_face_recog       
    
    async def get_session_count_for_trip(self, vehicle_id, start_time, end_time):
        online_packet_db = db.m_db['online_packets']
        online_packets = list(online_packet_db.find({
            'vehicleId': vehicle_id,
            'sentTime': {'$gte': start_time, '$lt': end_time}}).sort('sentTime', -1))
        grouped_online_packets = list(groupby(sorted(online_packets, key=itemgetter('sessionId')), key=itemgetter('sessionId')))                     
        return len(grouped_online_packets)
    
    async def update_trip_session_count(self, trip_id, session_count):
        if session_count == 0: session_count =1
        trip_detail = None
        try:
            db.cursor.execute(query.update_trip_with_session_count(),{
                'trip_id':trip_id, 
                'session_count':session_count
            })
            db.conn.commit()
            # self.result_to_mongo(os.getenv("MONGO_HOST_URI"), None, trip_id, 'SUCCESS')
            self.result_to_mongo(os.getenv("MONGO_HOST_URI"), None, trip_id, 'SUCCESS')
            return self.return_response(db.cursor)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return trip_detail


    async def update_packets_with_trip_id(self, vehicle_id, trip_id, start_time, end_time):
        session_count = await self.get_session_count_for_trip(vehicle_id, start_time, end_time)
        online_response = await self.update_online_packets_for_trip(vehicle_id=vehicle_id, trip_id=trip_id, start_time=start_time, end_time=end_time)
        anomaly_response = await self.update_anomaly_packets_for_trip(vehicle_id=vehicle_id, trip_id=trip_id, start_time=start_time, end_time=end_time)
        gps_response = await self.update_gps_packets_for_trip(vehicle_id=vehicle_id, trip_id=trip_id, start_time=start_time, end_time=end_time)
        face_recog_response = await self.update_face_recog_packets_for_trip(vehicle_id=vehicle_id, trip_id=trip_id, start_time=start_time, end_time=end_time)

        result = await self.update_trip_session_count(trip_id, session_count)
        logger.info(f"Online Packets Updated:{online_response.modified_count} \n Anomaly Packets Updated: {anomaly_response.modified_count}\
        \n Location Packets Updated: {gps_response.modified_count}\n Face Recognition Packets Updated: {face_recog_response.modified_count}\
        \n Session Count Update Result: {result['status']}")
    
    def result_to_mongo(self, client_ip, error, user_id, status):
        self.log_to_mongo(client_ip, user_id, db.cursor.query, status)
        if status == 'FAIL':
            self.return_exception(error)

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

    def get_map_from_object(self, map, anomaly):
        map.update(anomaly)
        return map

    def return_response(self, data):
        res = {'status': 200, 'result': data}
        return res

    def return_exception(self, error):
        traceback.print_exc()
        logger.error("Exception : {0}".format(str(error)))
        return {'status': 400, 'detail': str(error)}

if __name__ == '__main__':
    while True:
        try:
            DB = Trips()
        except Exception as e:
            traceback.print_exc()