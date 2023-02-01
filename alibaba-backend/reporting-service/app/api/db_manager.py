from utils import uuidv6, doctor_start_date_and_end_date
from fastapi import HTTPException
from typing import Union, Optional
from datetime import datetime, timedelta
from queries import query
from log import logger
from db import db
import psycopg2
import os
import pika
import math
import hashlib
import traceback
import pprint
import time
import json
from math import sin, cos, sqrt, atan2
from operator import itemgetter
from itertools import groupby
from fastapi.responses import JSONResponse
from cloud_channel_conn import cloud_channel_conn, CloudChannel


# ------------------ Report Generation Functions--------------------#


class Reports_Database():

    async def return_date_range(self, range_type):
        days = 1  # for daily
        if range_type == 'weekly':
            days = 7
        elif range_type == 'monthly':
            days = 30

        return [int(time.time() - timedelta(days=days).total_seconds()), int(time.time())]

    async def get_particular_vehicle_location_in_time_range(self, vehicle_plateno, start_time, end_time):
        location_db = db.m_db['location_packets']
        vehicle_location = location_db.find({'vehicleId': vehicle_plateno, 'epoch': {
            '$gte': start_time, '$lt': end_time}}).sort('epoch', -1)

        return vehicle_location

    async def get_particular_vehicle_details(self, plateno, user):
        vehicle_detail = None
        # print(f"plateno: {plateno}, user: {user}")
        try:
            db.cursor.execute(query.get_one_vehicle_of_manager(), {
                "user_id": user["user_id"], 'vehicle_plate_no': plateno, })
            vehicle_detail = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return vehicle_detail

    def get_calculated_travel_time_from_online_packets(self, online_packets):
        grouped_online_packets = groupby(sorted(
            online_packets, key=itemgetter('sessionId')), key=itemgetter('sessionId'))
        total_travel_time = 0
        for session_id, extracted_online_packets in grouped_online_packets:
            online_packet_list = sorted(list(
                extracted_online_packets), key=lambda x: x['payload']['timeStamp'], reverse=True)
            start_time = online_packet_list[-1]['payload']['timeStamp']
            end_time = online_packet_list[0]['payload']['timeStamp']
            total_time = (datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S.%f") -
                          datetime.strptime(start_time,
                                            "%Y-%m-%d %H:%M:%S.%f")).total_seconds()
            total_travel_time = total_travel_time + total_time
        return total_travel_time

    async def get_last_online_time(self, vehicleId, start_date, end_date):
        online_db = db.m_db['online_packets']

        vehicle_online = list(online_db.find(
            {'vehicleId': vehicleId,
             "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', -1))

        total_time_in_days = (datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S") -
                              datetime.strptime(start_date,
                                                "%Y-%m-%d %H:%M:%S")).days + 1
        if total_time_in_days == 0:
            total_time_in_days = 1
        if len(vehicle_online):
            start_time = vehicle_online[-1]['payload']['timeStamp']
            end_time = vehicle_online[0]['payload']['timeStamp']
            total_time = self.get_calculated_travel_time_from_online_packets(
                vehicle_online)
            last_online = vehicle_online[0]
            del last_online['_id']
            return last_online['payload'], total_time, total_time_in_days
        return None, 0, total_time_in_days

    async def get_last_location(self, vehicleId, start_time, end_time):
        location_db = db.m_db['location_packets']
        total_distance = 0
        speed = []

        vehicle_location = list(location_db.find({'vehicleId': vehicleId,
                                                  "payload.timeStamp": {"$lte": end_time, "$gte": start_time},
                                                  "payload.lastDistance": {"$gte": 0}
                                                  }).sort('payload.timeStamp', -1))
        if len(vehicle_location):
            total_distance = sum([x['payload']['lastDistance'] if 'lastDistance' in x['payload'].keys() else 0
                                  for x in vehicle_location])
            speed = ([float(x['payload']['speed']) if 'speed' in x['payload'].keys() else 0
                      for x in vehicle_location])
            end_location = vehicle_location[0]['payload']
            start_location = vehicle_location[-1]['payload']
            speed.sort(reverse=True)
            max_speed = speed[0]
            avg_speed = sum(speed)/len(speed)
            return end_location, start_location, total_distance, max_speed, avg_speed
        return None, None, 0, 0, 0

    async def get_current_driver(self, vehicle_id):
        online_db = db.m_db['online_packets']
        current_driver = {"status": 404}
        vehicle_online = list(online_db.find({'vehicleId': vehicle_id,
                                              # 'payload.timeStamp': filterCondition
                                              }).sort('payload.timeStamp', -1).limit(1))
        if len(vehicle_online):
            vehicle_online = vehicle_online[0]
            driver_id = '-'
            if 'driverId' in vehicle_online.keys():
                driver_id = vehicle_online["driverId"]
            current_driver = await self.get_driver_details(driver_id)
        return current_driver

    async def get_auth_status(self, vehicle_id):
        online_db = db.m_db['online_packets']
        vehicle_online = list(online_db.find({'vehicleId': vehicle_id,
                                              #   'payload.timeStamp': filterCondition
                                              }).sort('payload.timeStamp', -1).limit(1))
        if len(vehicle_online):
            vehicle_online = vehicle_online[0]
            if vehicle_online["driverId"] == "-":
                return {"auth_status": False}

        return {"auth_status": True}

    async def get_vehicle_anomaly_data(self, vehicle_id, start_date, end_date):
        start_date, end_date = doctor_start_date_and_end_date(
            start_date, end_date)
        anomalies_db = db.m_db['anomalies']
        all_anomaly_packets_in_time_range = list(anomalies_db.find(
            {'vehicleId': vehicle_id,
                "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', -1))
        anomaly_packets = groupby(sorted(all_anomaly_packets_in_time_range, key=itemgetter(
            'anomaly_type')), key=itemgetter('anomaly_type'))
        anomaly_data = {}
        for anomaly_type, anomaly_packet_list in anomaly_packets:
            anomaly_data[anomaly_type] = list(anomaly_packet_list)

        distracted_packet_list = anomaly_data.get('distracted_anomaly', [])
        drowsy_packet_list = anomaly_data.get('drowsy_anomaly', [])
        idle_anomaly_list = sorted(anomaly_data.get(
            'idle_anomaly', []), reverse=True, key=lambda x: x['payload']['timeStamp'])

        return self.generate_vehicle_anomalies(distracted_packet_list, drowsy_packet_list, idle_anomaly_list)

    def generate_vehicle_anomalies(self, distracted_packet_list, drowsy_packet_list, idle_anomaly_list):
        distracted_count = len(distracted_packet_list)
        drowsy_count = len(drowsy_packet_list)
        idle_time = sum([float(x['payload']['idleTime']) if 'idleTime' in x['payload'].keys() else 0
                         for x in idle_anomaly_list])
        return distracted_count, drowsy_count, idle_time

    async def get_location_packets_for_vehicle_session_by_date(self, vehicle_id, start_date, end_date):
        location_db = db.m_db['location_packets']
        start_date, end_date = doctor_start_date_and_end_date(
            start_date, end_date)
        all_location_packets_in_time_range = list(location_db.find(
            {'vehicleId': vehicle_id,
             "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', -1))
        grouped_location_packets = groupby(sorted(
            all_location_packets_in_time_range, key=itemgetter('sessionId')), key=itemgetter('sessionId'))
        location_packets_by_session = []
        for session_id, location_packets in grouped_location_packets:
            location_packets_by_session.append({
                'session_id': session_id,
                'location_packet_list': list(location_packets),
            })
        return location_packets_by_session

    async def get_anomaly_packets_for_vehicle_session_by_date(self, vehicle_id, start_date, end_date):
        anomaly_packets_by_session = []
        start_date, end_date = doctor_start_date_and_end_date(
            start_date, end_date)
        anomalies_db = db.m_db['anomalies']
        all_anomaly_packets_in_time_range = list(anomalies_db.find(
            {'vehicleId': vehicle_id,
             "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', -1))
        grouped_anomaly_packets = groupby(sorted(
            all_anomaly_packets_in_time_range, key=itemgetter('sessionId')), key=itemgetter('sessionId'))
        for session_id, anomaly_packets in grouped_anomaly_packets:
            anomaly_packets_by_session.append({
                'session_id': session_id,
                'anomaly_packet_list': list(anomaly_packets),
            })
        return anomaly_packets_by_session

    async def get_online_packets_for_vehicle_session_by_date(self, vehicle_id, start_date, end_date):
        online_db = db.m_db['online_packets']
        start_date, end_date = doctor_start_date_and_end_date(
            start_date, end_date)
        all_online_packets_in_time_range = list(online_db.find(
            {'vehicleId': vehicle_id,
             "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', -1))
        grouped_online_packets = groupby(sorted(all_online_packets_in_time_range, key=itemgetter(
            'sessionId')), key=itemgetter('sessionId'))
        online_packets_by_session = []
        for session_id, online_packets in grouped_online_packets:
            online_packets_by_session.append({
                'session_id': session_id,
                'online_packet_list': list(online_packets),
            })
        return online_packets_by_session

    # gets all packets in a specified time range against a vehicleid and returns them grouped by sessionIds
    async def get_vehicle_packets_grouped_by_session_by_date(self, vehicle_id, start_date, end_date):
        location_packets_by_session = await self.get_location_packets_for_vehicle_session_by_date(vehicle_id, start_date, end_date)
        anomaly_packets_by_session = await self.get_anomaly_packets_for_vehicle_session_by_date(vehicle_id, start_date, end_date)
        online_packets_by_session = await self.get_online_packets_for_vehicle_session_by_date(vehicle_id, start_date, end_date)

        sessionvise_packets = [{**u, **v, **w} for u, v, w in zip(
            location_packets_by_session, anomaly_packets_by_session, online_packets_by_session)]
        return sessionvise_packets

    def extract_driver_ids_from_packets(self, online_packets):
        driver_ids = []
        online_packets_grouped_by_driver = groupby(
            sorted(online_packets, key=itemgetter('driverId')), key=itemgetter('driverId'))
        for driver_id, packets in online_packets_grouped_by_driver:
            # print(driver_id)
            driver_ids.append(driver_id.strip())
        return driver_ids

    async def get_all_driver_details_in_time_range(self, vehicle_id, start_date, end_date):
        online_db = db.m_db['online_packets']
        driver_ids = list(online_db.distinct('driverId', {"vehicleId": vehicle_id,
                                                          "payload.timeStamp": {"$gte": start_date,
                                                                                "$lte": end_date}
                                                          }))
        driver_details = {}
        for driver_id in driver_ids:
            if driver_id == '-' or driver_id == '-\n':
                driver_detail = None
            else:
                driver_detail = await self.get_driver_details(driver_id)
            driver_details[driver_id] = driver_detail

        return driver_details

    def get_all_driver_details_for_session(self, all_driver_ids, all_driver_details):
        driver_details = []
        for driver_id in all_driver_ids:
            driver_details.append(all_driver_details[driver_id])
        return driver_details

    async def generate_vehicle_location_report_by_session(self, vehicle_id, start_time, end_time, user):
        start_time, end_time = doctor_start_date_and_end_date(
            start_time, end_time)
        report_data_for_all_sessions = []
        all_drivers_data = await self.get_all_driver_details_in_time_range(vehicle_id, start_time, end_time)
        all_session_data = await self.get_vehicle_packets_grouped_by_session_by_date(vehicle_id, start_time, end_time)
        vehicle_detail = await self.get_particular_vehicle_details(
            vehicle_id, user)  # object {which contains single vehicle}

        for session in all_session_data:
            session_id = session['session_id']
            session_anomaly_packets = sorted(
                session['anomaly_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)
            session_location_packets = sorted(
                session['location_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)
            session_online_packets = sorted(
                session['online_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)

            session_start_time, session_end_time = session_online_packets[-1]['payload'][
                'timeStamp'], session_online_packets[0]['payload']['timeStamp']
            sesstion_total_time = (datetime.strptime(session_end_time, "%Y-%m-%d %H:%M:%S.%f") -
                                   datetime.strptime(session_start_time,
                                                     "%Y-%m-%d %H:%M:%S.%f")).total_seconds()
            session_distracted_count, session_drowsy_count, session_idle_time = self.extract_anomaly_data_from_packets(
                session_anomaly_packets)
            session_max_speed, session_avg_speed, session_total_distance, path_data_for_session = self.extract_location_data_from_packets(
                session_location_packets)
            start_location = session_location_packets[-1]['payload']
            end_location = session_location_packets[0]['payload']

            driver_ids_for_session = self.extract_driver_ids_from_packets(
                session_online_packets)
            driver_details = self.get_all_driver_details_for_session(
                driver_ids_for_session, all_drivers_data)

            current_driver_details = all_drivers_data[session_online_packets[0]['driverId']]
            report_data_for_all_sessions.append({
                'session_id': session_id, 'vehicle_detail': vehicle_detail, 'driver_details': driver_details,
                'start_location': start_location, 'end_location': end_location, 'route_location_data': path_data_for_session,
                'start_time': session_start_time, 'end_time': session_end_time, 'total_time': sesstion_total_time,
                'total_distance': session_total_distance, 'total_idle_time': session_idle_time,
                'total_events': session_drowsy_count+session_distracted_count, 'drowsy_count': session_drowsy_count,
                'distracted_count': session_distracted_count, 'travel_time': (sesstion_total_time-session_idle_time),
                'max_speed': session_max_speed, 'avg_speed': session_avg_speed,
                'current_driver': current_driver_details, 'auth_status': True if current_driver_details else False
            })
        return self.return_response(report_data_for_all_sessions)

    async def generate_vehicle_location_report(self, vehicle_id, start_time, end_time, user):
        start_time, end_time = doctor_start_date_and_end_date(
            start_time, end_time)

        end_location, start_location, total_distance, max_speed, avg_speed = await self.get_last_location(
            vehicle_id, start_time, end_time)
        last_online, total_time, total_time_in_days = await self.get_last_online_time(
            vehicle_id, start_time, end_time)
        vehicle_detail = await self.get_particular_vehicle_details(
            vehicle_id, user)  # object {which contains single vehicle}

        current_driver = await self.get_current_driver(vehicle_id)
        auth_status = await self.get_auth_status(vehicle_id)
        distracted_count, drowsy_count, idle_time = await self.get_vehicle_anomaly_data(vehicle_id, start_time, end_time)
        return self.return_response(
            {"start_location": start_location, "end_location": end_location,
             "distance_per_day": total_distance/total_time_in_days, "total_distance": total_distance,
             "max_speed": max_speed, "avg_speed": avg_speed, "travel_time": abs(total_time-idle_time),
             "last_online": last_online, "total_time_in_days": total_time_in_days, "distracted_count": distracted_count,
             "drowsy_count": drowsy_count, "total_idle_time": idle_time,
             "travel_time_per_day": abs((total_time-idle_time)/total_time_in_days),
             "vehicle_detail": vehicle_detail, "current_driver": current_driver, **auth_status})

    async def get_particular_driver_anomalies_in_time_range(self, driver_id, start_time, end_time):
        anomalies_db = db.m_db['anomalies']

        driver_anomalies = list(anomalies_db.find(
            {'driverId': driver_id,
             "payload.timeStamp": {"$lte": end_time, "$gte": start_time},
             "anomaly_type": {"$ne": "unauthorized_anomaly"}
             }
        ).sort('payload.timeStamp', -1))
        return driver_anomalies

    async def get_distracted(self, driver_id, start_time, end_time):
        anomalies_db = db.m_db['anomalies']

        driver_anomalies = list(anomalies_db.find(
            {'driverId': driver_id,
             "payload.timeStamp": {"$lte": end_time, "$gte": start_time},
             "anomaly_type": {"$eq": "distracted_anomaly"}
             }
        ).sort('payload.timeStamp', -1))
        return driver_anomalies

    async def get_drowsy_count(self, driver_id, start_time, end_time):
        anomalies_db = db.m_db['anomalies']

        driver_anomalies = list(anomalies_db.find(
            {'driverId': driver_id,
             "payload.timeStamp": {"$lte": end_time, "$gte": start_time},
             "anomaly_type": {"$eq": "drowsy_anomaly"}
             }
        ).sort('payload.timeStamp', -1))
        return driver_anomalies

    async def get_idle_anomalies(self, driver_id, start_time, end_time):
        anomalies_db = db.m_db['anomalies']
        driver_anomalies = list(anomalies_db.find(
            {'driverId': driver_id,
             "payload.timeStamp": {"$lte": end_time, "$gte": start_time},
             "anomaly_type": {"$eq": "idle_anomaly"}
             }
        ).sort('payload.timeStamp', -1))

        total_idle_time = sum([float(x['payload']['idleTime']) if 'idleTime' in x['payload'].keys() else 0
                               for x in driver_anomalies])

        return total_idle_time

    async def get_particular_driver_details(self, driver_id, user):
        driver_detail = None
        # print({
        #     'user_id': user["user_id"], 'driver_id': driver_id})
        try:
            db.cursor.execute(query.get_one_driver_of_manager(), {
                'user_id': user["user_id"], 'driver_id': driver_id})
            driver_detail = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return driver_detail

    async def get_driver_details(self, driver_id):
        driver_detail = None

        # print({
        #     'driver_id': driver_id})
        try:
            db.cursor.execute(query.get_driver(), {
                'driver_id': driver_id})
            driver_detail = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return driver_detail

    def distance_latlng(self, location1, location2):
        R = 6373.0

        lat1 = float(location1["latitude"])
        lon1 = float(location1["longitude"])
        lat2 = float(location2["latitude"])
        lon2 = float(location2['longitude'])

        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = (sin(dlat / 2)) ** 2 + cos(lat1) * cos(lat2) * (sin(dlon / 2)) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        distance = R * c
        return distance

    async def get_total_distance(self, driver_id, start_date, end_date):
        # print(f"driver_id :{driver_id}")
        location_db = db.m_db['location_packets']

        location_data = list(location_db.find(
            {'driverId': driver_id,
             "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', 1))

        total_distance = sum([x['payload']['lastDistance'] if 'lastDistance' in x['payload'].keys() else 0
                              for x in location_data])
        # print(f"total_distance: {total_distance}")
        return total_distance

    async def get_start_and_end_times_of_sessions_in_time_range(self, all_sessions_for_driver, days_date_range):
        online_db = db.m_db['online_packets']
        total_time_for_all_sessions = 0
        total_time_for_session = 0
        for session in all_sessions_for_driver:
            all_packets_for_current_session = list(
                online_db.find({"sessionId": session}).sort('payload.timeStamp', -1))
            if len(all_packets_for_current_session):
                current_session_start_time = all_packets_for_current_session[-1]['payload']['timeStamp']
                current_session_end_time = all_packets_for_current_session[0]['payload']['timeStamp']
                total_time_for_session = (datetime.strptime(current_session_end_time, "%Y-%m-%d %H:%M:%S.%f") -
                                          datetime.strptime(current_session_start_time,
                                                            "%Y-%m-%d %H:%M:%S.%f")).total_seconds()
                total_time_for_all_sessions += total_time_for_session
        avg_time_for_date_range = total_time_for_all_sessions / \
            (days_date_range if total_time_for_session > 0 else 1)
        return total_time_for_all_sessions, avg_time_for_date_range

    async def get_particular_driver_session_ids_in_time_range(self, driver_id, start_date, end_date):
        online_db = db.m_db['online_packets']
        driver_sessions = list(online_db.distinct('sessionId', {"driverId": driver_id,
                                                                "payload.timeStamp": {"$gte": start_date,
                                                                                      "$lte": end_date}
                                                                }))
        # print(f"driver_sessions: {driver_sessions}")
        days_in_date_range = int((datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S") -
                                  datetime.strptime(start_date,
                                                    "%Y-%m-%d %H:%M:%S")).days)
        if days_in_date_range == 0:
            days_in_date_range = 1
        return {"driver_sessions": driver_sessions, "days_in_date_range": days_in_date_range}

    async def get_location_packets_for_driver_session(self, driver_id, start_date, end_date):
        location_db = db.m_db['location_packets']
        start_date, end_date = doctor_start_date_and_end_date(
            start_date, end_date)
        all_location_packets_in_time_range = list(location_db.find(
            {'driverId': driver_id,
             "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', -1))
        grouped_location_packets = groupby(sorted(
            all_location_packets_in_time_range, key=itemgetter('sessionId')), key=itemgetter('sessionId'))
        location_packets_by_session = []
        for session_id, location_packets in grouped_location_packets:
            location_packets_by_session.append({
                'session_id': session_id,
                'location_packet_list': list(location_packets),
            })
        return location_packets_by_session

    async def get_anomaly_packets_for_driver_session(self, driver_id, start_date, end_date):
        anomaly_packets_by_session = []
        start_date, end_date = doctor_start_date_and_end_date(
            start_date, end_date)
        anomalies_db = db.m_db['anomalies']
        all_anomaly_packets_in_time_range = list(anomalies_db.find(
            {'driverId': driver_id,
             "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', -1))
        grouped_anomaly_packets = groupby(sorted(
            all_anomaly_packets_in_time_range, key=itemgetter('sessionId')), key=itemgetter('sessionId'))
        for session_id, anomaly_packets in grouped_anomaly_packets:
            anomaly_packets_by_session.append({
                'session_id': session_id,
                'anomaly_packet_list': list(anomaly_packets),
            })
        return anomaly_packets_by_session

    async def get_online_packets_for_driver_session(self, driver_id, start_date, end_date):
        online_db = db.m_db['online_packets']
        start_date, end_date = doctor_start_date_and_end_date(
            start_date, end_date)
        all_online_packets_in_time_range = list(online_db.find(
            {'driverId': driver_id,
             "payload.timeStamp": {"$lte": end_date, "$gte": start_date}
             }
        ).sort('payload.timeStamp', -1))
        grouped_online_packets = groupby(sorted(all_online_packets_in_time_range, key=itemgetter(
            'sessionId')), key=itemgetter('sessionId'))
        online_packets_by_session = []
        for session_id, online_packets in grouped_online_packets:
            online_packets_by_session.append({
                'session_id': session_id,
                'online_packet_list': list(online_packets),
            })
        return online_packets_by_session

    # gets all packets in a specified time range against a driverid and returns them grouped by sessionIds
    async def get_driver_packets_grouped_by_session(self, driver_id, start_date, end_date):
        location_packets_by_session = await self.get_location_packets_for_driver_session(driver_id, start_date, end_date)
        anomaly_packets_by_session = await self.get_anomaly_packets_for_driver_session(driver_id, start_date, end_date)
        online_packets_by_session = await self.get_online_packets_for_driver_session(driver_id, start_date, end_date)

        sessionvise_packets = [{**u, **v, **w} for u, v, w in zip(
            location_packets_by_session, anomaly_packets_by_session, online_packets_by_session)]
        return sessionvise_packets

    # calculate anomaly data from anomaly packet list
    def extract_anomaly_data_from_packets(self, session_anomaly_packets):
        anomaly_packets = groupby(sorted(session_anomaly_packets, key=itemgetter(
            'anomaly_type')), key=itemgetter('anomaly_type'))
        anomaly_data = {}
        for anomaly_type, anomaly_packet_list in anomaly_packets:
            anomaly_data[anomaly_type] = list(anomaly_packet_list)

        distracted_packet_list = anomaly_data.get('distracted_anomaly', [])
        drowsy_packet_list = anomaly_data.get('drowsy_anomaly', [])
        idle_anomaly_list = sorted(anomaly_data.get(
            'idle_anomaly', []), reverse=True, key=lambda x: x['payload']['timeStamp'])

        session_distracted_count = len(distracted_packet_list)
        session_drowsy_count = len(drowsy_packet_list)
        session_idle_time = sum([float(x['payload']['idleTime']) if 'idleTime' in x['payload'].keys() else 0
                                 for x in idle_anomaly_list])
        return session_distracted_count, session_drowsy_count, session_idle_time

    # calculate and extract location and speed data from location packets
    def extract_location_data_from_packets(self, session_location_packets):
        session_total_distance = 0
        speed_data_for_session = []
        path_data_for_session = []
        for packet in session_location_packets:
            speed_data_for_session.append(float(packet['payload']['speed']))
            path_data_for_session.append({
                'longitude': packet['payload']['longitude'],
                'latitude': packet['payload']['latitude'],
                'speed': packet['payload']['speed'],
                'time_stamp': packet['payload']['timeStamp']
            })
            session_total_distance += float(packet.get('payload',
                                            {}).get('lastDistance', 0))
        speed_data_for_session.sort(reverse=True)
        session_max_speed = speed_data_for_session[0]
        session_avg_speed = sum(speed_data_for_session) / \
            len(speed_data_for_session)
        return session_max_speed, session_avg_speed, session_total_distance, path_data_for_session

    async def generate_driver_anomalies_report_by_session(self, driver_id, start_date, end_date, user):

        all_session_data = await self.get_driver_packets_grouped_by_session(driver_id, start_date, end_date)
        driver_detail = await self.get_particular_driver_details(driver_id, user)
        report_data_for_all_sessions = []
        for session in all_session_data:
            session_id = session['session_id']
            session_anomaly_packets = sorted(
                session['anomaly_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)
            session_location_packets = sorted(
                session['location_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)
            session_online_packets = sorted(
                session['online_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)

            session_start_time, session_end_time = session_online_packets[-1]['payload'][
                'timeStamp'], session_online_packets[0]['payload']['timeStamp']
            sesstion_total_time = (datetime.strptime(session_end_time, "%Y-%m-%d %H:%M:%S.%f") -
                                   datetime.strptime(session_start_time,
                                                     "%Y-%m-%d %H:%M:%S.%f")).total_seconds()
            session_distracted_count, session_drowsy_count, session_idle_time = self.extract_anomaly_data_from_packets(
                session_anomaly_packets)
            session_max_speed, session_avg_speed, session_total_distance, path_data_for_session = self.extract_location_data_from_packets(
                session_location_packets)

            report_data_for_all_sessions.append({
                'session_id': session_id, 'driver_detail': driver_detail,
                'start_time': session_start_time, 'end_time': session_end_time,
                'total_time': sesstion_total_time, 'total_distance': session_total_distance,
                'total_idle_time': session_idle_time, 'total_events': session_drowsy_count+session_distracted_count,
                'drowsy_count': session_drowsy_count, 'distracted_count': session_distracted_count,
                'travel_time': (sesstion_total_time-session_idle_time), 'route_location_data': path_data_for_session,
                'max_speed': session_max_speed, 'avg_speed': session_avg_speed
            })
        return self.return_response(report_data_for_all_sessions)

    async def generate_driver_anomalies_report(self, driver_id, start_date, end_date, user):

        start_date, end_date = doctor_start_date_and_end_date(
            start_date, end_date)
        all_anomalies = await self.get_particular_driver_anomalies_in_time_range(
            driver_id, start_date, end_date)

        distracted_count = await self.get_distracted(
            driver_id, start_date, end_date)

        drowsy_count = await self.get_drowsy_count(
            driver_id, start_date, end_date)

        total_idle_time = await self.get_idle_anomalies(driver_id, start_date, end_date)

        driver_detail = await self.get_particular_driver_details(driver_id, user)
        total_distance = await self.get_total_distance(driver_id, start_date, end_date)
        start_time = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
        end_time = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")

        numofdays = (end_time - start_time).days
        if numofdays == 0:
            numofdays = 1

        response = await self.get_particular_driver_session_ids_in_time_range(driver_id, start_date, end_date)

        total_time, avg_time_for_date_range = await self.get_start_and_end_times_of_sessions_in_time_range(
            response['driver_sessions'], response['days_in_date_range'])

        return self.return_response({"total_distance": total_distance, "driver_detail": driver_detail,
                                     "avg_distance": abs(total_distance / numofdays),
                                     "total_events": len(all_anomalies),
                                     "average_events": len(all_anomalies) / numofdays,
                                     "distracted_count": len(distracted_count), "drowsy_count": len(drowsy_count),
                                     "total_time": total_time, "avg_time_for_date_range": avg_time_for_date_range,
                                     "total_idle_time": total_idle_time,
                                     'avg_idle_time_per_day': total_idle_time / numofdays

                                     })

    async def get_trip_location_packets(self, trip_id, vehicle_id):
        location_db = db.m_db['location_packets']
        all_location_packets_in_time_range = list(location_db.find(
            {'tripId': trip_id, 'vehicleId': vehicle_id

             }
        ).sort('payload.timeStamp', -1))
        return all_location_packets_in_time_range

    async def get_trip_anomaly_packets(self, trip_id, vehicle_id):
        anomalies_db = db.m_db['anomalies']
        all_anomaly_packets_in_time_range = list(anomalies_db.find(
            {'tripId': trip_id, 'vehicleId': vehicle_id

             }
        ).sort('payload.timeStamp', -1))
        return all_anomaly_packets_in_time_range

    async def get_trip_online_packets(self, trip_id, vehicle_id):
        online_db = db.m_db['online_packets']
        all_online_packets_in_time_range = list(online_db.find(
            {'tripId': trip_id, 'vehicleId': vehicle_id

             }
        ).sort('payload.timeStamp', -1))
        return all_online_packets_in_time_range

    async def get_trip_ids_in_time_range(self, start_date, end_date, vehicle_id):
        trip_detail = None
        try:
            db.cursor.execute(query.get_trip_ids_in_time_range(), {
                'trip_start': start_date, 'trip_end': end_date, 'vehicle_id': vehicle_id})
            trip_detail = db.cursor.fetchall()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        trip_ids = [x['trip_id'] for x in trip_detail]
        return trip_ids

    def calculate_total_time_and_days(self, online_packets):
        trip_start_time = online_packets[-1]['payload']['timeStamp']
        trip_end_time = online_packets[0]['payload']['timeStamp']
        total_travel_time = self.get_calculated_travel_time_from_online_packets(
            online_packets)
        travel_time_in_days = math.ceil((total_travel_time/3600)/24)
        last_online = online_packets[0]
        del last_online['_id']
        return total_travel_time, travel_time_in_days, last_online, trip_start_time, trip_end_time

    def get_location_packets_for_vehicle_session(self, all_location_packets_in_time_range):

        grouped_location_packets = groupby(sorted(
            all_location_packets_in_time_range, key=itemgetter('sessionId')), key=itemgetter('sessionId'))
        location_packets_by_session = []
        for session_id, location_packets in grouped_location_packets:
            location_packets_by_session.append({
                'session_id': session_id,
                'location_packet_list': list(location_packets),
            })
        return location_packets_by_session

    def get_anomaly_packets_for_vehicle_session(self, all_anomaly_packets_in_time_range):
        anomaly_packets_by_session = []

        grouped_anomaly_packets = groupby(sorted(
            all_anomaly_packets_in_time_range, key=itemgetter('sessionId')), key=itemgetter('sessionId'))
        for session_id, anomaly_packets in grouped_anomaly_packets:
            anomaly_packets_by_session.append({
                'session_id': session_id,
                'anomaly_packet_list': list(anomaly_packets),
            })
        return anomaly_packets_by_session

    def get_online_packets_for_vehicle_session(self, all_online_packets_in_time_range):

        grouped_online_packets = groupby(sorted(all_online_packets_in_time_range, key=itemgetter(
            'sessionId')), key=itemgetter('sessionId'))
        online_packets_by_session = []
        for session_id, online_packets in grouped_online_packets:
            online_packets_by_session.append({
                'session_id': session_id,
                'online_packet_list': list(online_packets),
            })
        return online_packets_by_session

    # gets all packets in a specified time range against a vehicleid and returns them grouped by sessionIds
    async def get_vehicle_packets_grouped_by_session(self, online_packets, anomaly_packets, location_packets):
        session_anomaly_packets = self.get_anomaly_packets_for_vehicle_session(
            anomaly_packets)
        session_location_packets = self.get_location_packets_for_vehicle_session(
            location_packets)
        session_online_packets = self.get_online_packets_for_vehicle_session(
            online_packets)

        sessionvise_packets = [{**u, **v, **w} for u, v, w in zip(
            session_location_packets, session_anomaly_packets, session_online_packets)]
        return sessionvise_packets

    async def generate_vehicle_anomaly_report_by_session(self, online_packets, anomaly_packets, location_packets, vehicle_detail, all_drivers_data):
        report_data_for_all_sessions = []

        all_session_data = await self.get_vehicle_packets_grouped_by_session(online_packets, anomaly_packets, location_packets)
        # object {which contains single vehicle}

        for session in all_session_data:
            session_id = session['session_id']
            session_anomaly_packets = sorted(
                session['anomaly_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)
            session_location_packets = sorted(
                session['location_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)
            session_online_packets = sorted(
                session['online_packet_list'], key=lambda x: x['payload']['timeStamp'], reverse=True)

            session_start_time, session_end_time = session_online_packets[-1]['payload'][
                'timeStamp'], session_online_packets[0]['payload']['timeStamp']
            sesstion_total_time = (datetime.strptime(session_end_time, "%Y-%m-%d %H:%M:%S.%f") -
                                   datetime.strptime(session_start_time,
                                                     "%Y-%m-%d %H:%M:%S.%f")).total_seconds()
            session_distracted_count, session_drowsy_count, session_idle_time = self.extract_anomaly_data_from_packets(
                session_anomaly_packets)
            session_max_speed, session_avg_speed, session_total_distance, path_data_for_session = self.extract_location_data_from_packets(
                session_location_packets)
            start_location = session_location_packets[-1]['payload']
            end_location = session_location_packets[0]['payload']

            driver_ids_for_session = self.extract_driver_ids_from_packets(
                session_online_packets)
            driver_details = self.get_all_driver_details_for_session(
                driver_ids_for_session, all_drivers_data)

            current_driver_details = all_drivers_data[session_online_packets[0]['driverId'].strip(
            )]
            report_data_for_all_sessions.append({
                'session_id': session_id, 'vehicle_detail': vehicle_detail, 'driver_details': driver_details,
                'start_location': start_location, 'end_location': end_location, 'route_location_data': path_data_for_session,
                'start_time': session_start_time, 'end_time': session_end_time, 'total_time': sesstion_total_time,
                'total_distance': session_total_distance, 'total_idle_time': session_idle_time,
                'total_events': session_drowsy_count+session_distracted_count, 'drowsy_count': session_drowsy_count,
                'distracted_count': session_distracted_count, 'travel_time': (sesstion_total_time-session_idle_time),
                'max_speed': session_max_speed, 'avg_speed': session_avg_speed,
                'current_driver': current_driver_details, 'auth_status': True if current_driver_details else False
            })
        return report_data_for_all_sessions

    async def generate_vehicle_anomaly_report_by_trip(self, vehicle_id, start_date, end_date, user):
        trip_report_date = []
        trip_ids_in_time_range = await self.get_trip_ids_in_time_range(start_date, end_date, vehicle_id)
        all_drivers_data = await self.get_all_driver_details_in_time_range(vehicle_id, start_date, end_date)

        for trip_id in trip_ids_in_time_range:
            online_packets = await self.get_trip_online_packets(trip_id, vehicle_id)
            anomaly_packets = await self.get_trip_anomaly_packets(trip_id, vehicle_id)
            location_packets = await self.get_trip_location_packets(trip_id, vehicle_id)

            if len(location_packets) and len(online_packets) and len(anomaly_packets):
                current_driver = await self.get_current_driver(vehicle_id)
                auth_status = await self.get_auth_status(vehicle_id)

                vehicle_detail = await self.get_particular_vehicle_details(
                    vehicle_id, user)
                total_time, travel_time_in_days, last_online, trip_start_time, trip_end_time = self.calculate_total_time_and_days(
                    online_packets)
                driver_ids_for_session = self.extract_driver_ids_from_packets(
                    online_packets)
                driver_details = self.get_all_driver_details_for_session(
                    driver_ids_for_session, all_drivers_data)
                trip_distracted_count, trip_drowsy_count, trip_idle_time = self.extract_anomaly_data_from_packets(
                    anomaly_packets)
                trip_max_speed, trip_avg_speed, trip_total_distance, path_data_for_trip = self.extract_location_data_from_packets(
                    location_packets)
                session_data_for_trip = await self.generate_vehicle_anomaly_report_by_session(online_packets, anomaly_packets, location_packets, vehicle_detail, all_drivers_data)
                trip_report = {
                    'avg_speed': trip_avg_speed, 'max_speed': trip_max_speed, 'total_distance': trip_total_distance, 'anomaly_count': trip_distracted_count+trip_drowsy_count,
                    'distracted_count': trip_distracted_count, 'drowsy_count': trip_drowsy_count, 'current_driver': current_driver, **auth_status,
                    'idle_time': trip_idle_time, 'path_data': path_data_for_trip, 'start_location': location_packets[-1]['payload'], 'end_location': location_packets[0]['payload'],
                    'driver_details': driver_details, 'travel_time': total_time-trip_idle_time, 'travel_time_in_days': travel_time_in_days, 'last_online': last_online,
                    'total_time': total_time, 'vehicle_detail': vehicle_detail, 'sessions': session_data_for_trip, 'distance_per_day': (trip_total_distance/travel_time_in_days),
                    'trip_id': trip_id, 'start_time': trip_start_time, 'end_time': trip_end_time

                }

                trip_report_date.append(trip_report)
        return trip_report_date

    # Reports Rework Starts From Here

    def doctor_start_and_end_time(self, start_time, end_time):
        start_time = start_time + ' 00:00:00'
        end_time = end_time + ' 23:59:59'

        return start_time, end_time

    # def calculate_individual_session_metrics(self, trip_id, session_data):

    def calculate_individual_trip_metrics(self, trip_id, sessions_in_trip):
        max_speed = 0
        avg_speed = 0
        total_distance = 0
        trip_idle_time = 0
        distracted_count = 0
        drowsy_count = 0
        trip_travel_time = 0
        trip_total_time = 0
        session_count = 0
        path_data = []
        session_drivers = {}
        # sessions_in_trip = sorted(
        #     sessions_in_trip, key=itemgetter('start_time'))
        for session in sessions_in_trip:
            session_count += 1
            online_time = (datetime.strptime(session.get('end_time'), "%Y-%m-%d %H:%M:%S.%f") -
                           datetime.strptime(session.get('start_time'),
                                             "%Y-%m-%d %H:%M:%S.%f")).total_seconds()
            travel_time = online_time - session.get('total_idle_time', 0)
            session['total_time'] = online_time
            session['travel_time'] = travel_time
            session['start_location'] = session.get(
                'vehicle_route')[0] if session.get('vehicle_route') else None
            session['end_location'] = session.get(
                'vehicle_route')[-1] if session.get('vehicle_route') else None
            avg_speed += session.get('avg_speed', 0)
            max_speed = session.get('max_speed', 0) if max_speed < session.get(
                'max_speed', 0) else max_speed
            trip_idle_time += session.get('total_idle_time', 0)
            trip_travel_time += session.get('travel_time')
            trip_total_time += session.get('total_time')
            drowsy_count += session.get('drowsy_count', 0)
            distracted_count += session.get('distracted_count', 0)
            total_distance += session.get('total_distance', 0)
            path_data += session.get('vehicle_route', [])
            drivers = session.get('drivers', [])
            for driver in drivers:
                session_drivers[driver['driver_id']] = driver
        return {
            'start_time': sessions_in_trip[0]['start_time'],
            'end_time': sessions_in_trip[-1]['end_time'],
            'start_location': path_data[0] if path_data else None,
            'end_location': path_data[-1] if path_data else None,
            'trip_id': trip_id,
            'avg_speed': avg_speed/session_count,
            'max_speed': max_speed,
            'total_idle_time': trip_idle_time,
            'total_distance': total_distance,
            'drowsy_count': drowsy_count,
            'distracted_count': distracted_count,
            'vehicle_route': path_data,
            'drivers': session_drivers,
            'sessions': sessions_in_trip,
            'travel_time': trip_travel_time,
            'total_time': trip_total_time
        }

    def compile_overall_report(self, grouped_trip_sessions):
        trips = []
        max_speed = 0
        avg_speed = 0
        total_distance = 0
        trip_idle_time = 0
        distracted_count = 0
        drowsy_count = 0
        total_time = 0
        total_travel_time = 0
        path_data = []
        drivers = {}
        trip_count = 0
        for trip_id, session_list in grouped_trip_sessions:
            trip_count += 1
            single_trip_data = self.calculate_individual_trip_metrics(
                trip_id, list(session_list))
            avg_speed += single_trip_data.get('avg_speed', 0)
            max_speed = single_trip_data.get('max_speed', 0) if max_speed < single_trip_data.get(
                'max_speed', 0) else max_speed
            trip_idle_time += single_trip_data.get('total_idle_time', 0)
            drowsy_count += single_trip_data.get('drowsy_count', 0)
            distracted_count += single_trip_data.get('distracted_count', 0)
            total_distance += single_trip_data.get('total_distance', 0)
            path_data += single_trip_data.get('vehicle_route', [])

            drivers = drivers | single_trip_data.get('drivers')
            total_travel_time += single_trip_data.get('travel_time', 0)
            total_time += single_trip_data.get('total_time', 0)
            trips.append(single_trip_data)
            # current_session_data = self.calculate_individual_session_metrics(session)
        return {
            'start_time': trips[0]['start_time'],
            'start_location': path_data[0] if path_data else None,
            'end_location': path_data[-1] if path_data else None,
            'send_time': trips[-1]['end_time'],
            'avg_speed': avg_speed/trip_count,
            'max_speed': max_speed,
            'total_idle_time': trip_idle_time,
            'total_distance': total_distance,
            'drowsy_count': drowsy_count,
            'distracted_count': distracted_count,
            'travel_time': total_travel_time,
            'total_time': total_time,
            'vehicle_route': sorted(path_data, key=itemgetter('timestamp')),
            'drivers': drivers,
            'trips': trips
        }

    async def calculate_vehicle_report_data(self, vehicle_id: str, start_time: str, end_time: str, user):
        session_db = db.m_db['session_data']

        start_time, end_time = self.doctor_start_and_end_time(
            start_time, end_time)
        # object {which contains single vehicle}
        vehicle_detail = await self.get_particular_vehicle_details(vehicle_id, user)
        sessions_in_time_range = session_db.find(
            {'vehicle_id': vehicle_id,
             "start_time": {"$gte": start_time},
             "end_time": {"$lte": end_time}}, {"_id": 0, "vehicle_id": 0}
        ).sort('trip_id', 1)

        number_of_sessions = sessions_in_time_range.explain().get(
            "executionStats", {}).get("nReturned")
        if number_of_sessions == 0:
            return JSONResponse(status_code=401, content={'message': f"No data available to generate report", 'status': 401})
        grouped_session = groupby(
            sessions_in_time_range, key=itemgetter('trip_id'))
        response = self.compile_overall_report(grouped_session)
        response['vehicle_details'] = vehicle_detail
        for driver in response['drivers']:
            if driver.strip() != '-':
                response['drivers'][driver]['driver_details'] = await self.get_driver_details(
                    driver)
        return response

    async def update_or_add_trip(self, active_trip, trip, client_ip):
        if active_trip is not None:

            if trip.status == "start":
                return JSONResponse(status_code=401, content={'message': f"{active_trip['trip_id']} There is already a trip in progress for the vehicle", 'status': 401})
            else:
                logger.info(
                    f"{active_trip['trip_id']} Marking trip as finished")
                response = await self.update_and_end_trip(client_ip, trip)
                # logger.debug(response)
                return JSONResponse(status_code=201, content={'message': f"{active_trip['trip_id']} Marked as Completed", 'status': 201})
        else:
            if trip.status == "start":
                response = await self.add_new_trip(client_ip, trip)
                # logger.debug(response)
                logger.info('No trips in progress, creating new trip')
                return JSONResponse(status_code=201, content={'message': "New trip created succesfully", 'status': 201})
            else:
                return JSONResponse(status_code=400, content={'message': "No ongoing trips found to mark as completed", 'status': 400})

    async def get_last_warehouse_location(self, vehicle_id):
        location_db = db.m_db['location_packets']
        latest_location_packet = list(location_db.find(
            {
                'vehicleId': vehicle_id, 'payload.atWarehouse': True
            }
        ).sort('payload.timeStamp', -1).limit(1))

        latitude = latest_location_packet[0]['payload']['latitude']
        longitude = latest_location_packet[0]['payload']['longitude']
        time = latest_location_packet[0]['payload']['timeStamp']
        return latitude, longitude, time

    async def get_active_trip_details(self, vehicle_id):
        trip_detail = None
        try:
            db.cursor.execute(query.get_active_trip(), {
                'vehicle_id': vehicle_id})
            trip_detail = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return trip_detail

    async def add_new_trip(self, client_ip: str, trip):
        try:
            db.cursor.execute(query.add_new_trip(), {'trip_id': trip.trip_id, 'vehicle_id': trip.vehicle_id,
                                                     'trip_start': trip.start_time})
            db.conn.commit()
            self.result_to_mongo(client_ip, None, trip.trip_id, 'SUCCESS')
            return self.return_response(db.cursor)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, trip.trip_id, 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, trip.trip_id, 'FAIL')
        return {'status': 400}

    async def update_and_end_trip(self, client_ip: str, trip):

        try:
            db.cursor.execute(query.update_trip(), {
                              'trip_id': trip.trip_id, 'trip_end': datetime.utcnow(), 'ongoing': False})
            db.conn.commit()
            self.result_to_mongo(client_ip, None, trip.trip_id, 'SUCCESS')
            return self.return_response(db.cursor)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, trip.trip_id, 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, trip.trip_id, 'FAIL')
        return {'status': 400}

    async def start_or_stop_trip_and_send_to_device(self, trip, user, client_ip):
        try:
            manager_id = user['user_id']
            msg = {
                "vehicle_id": trip.vehicle_id,
                "start_time": trip.start_time,
                "status": trip.status
            }
            active_trip_details = await self.get_active_trip_details(trip.vehicle_id)
            if trip.status == 'start':
                msg["trip_id"] = uuidv6()
                trip.trip_id = msg["trip_id"]
                response = await self.update_or_add_trip(active_trip_details, trip, client_ip)
            else:
                trip.trip_id = active_trip_details.get(
                    "trip_id") if active_trip_details else None
                response = await self.update_or_add_trip(active_trip_details, trip, client_ip)

            str2hash = trip.vehicle_id.strip()
            routing_key = hashlib.md5(str2hash.encode())
            routing_key = str(routing_key.hexdigest())

            if response.status_code == 201:
                try:
                    CloudChannel.queue_declare(queue=routing_key)
                    CloudChannel.basic_publish(
                        exchange='', routing_key=routing_key, body=str(msg), properties=pika.BasicProperties(
                            delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE))
                except pika.exceptions.UnroutableError:
                    pass

                except (Exception) as error:
                    traceback.print_exc()
                    cloud_channel_conn.reconnect(routing_key, str(msg), properties=pika.BasicProperties(
                        delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE))
            cloud_channel_conn.disconnect()
        except (Exception) as error:
            print("Error in Creating Trip", error)
            traceback.print_exc()
        return response

    def call_back_print(self):
        print("message_failed to send")

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
        logger.error("Exception : {0}".format(str(error)))
        return {'status': 400, 'detail': str(error)}


reports_db = Reports_Database()
