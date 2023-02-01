import pika
import os
import math
import traceback
import Packets_pb2
import requests
import os.path
import redis
import json
from threading import Thread
from queue import Queue
from pymongo import MongoClient
from google.protobuf.json_format import MessageToDict
import configparser
import uuid


def generate_uuidv6():
    u = uuid.uuid1()
    uh = u.hex
    tlo1 = uh[:5]
    tlo2 = uh[5:8]
    tmid = uh[8:12]
    thig = uh[13:16]
    rest = uh[16:]
    uh6 = thig + tmid + tlo1 + '6' + tlo2 + rest

    return str(uuid.UUID(hex=uh6))


def uuidv6():
    return generate_uuidv6()


class Database:

    def __init__(self):
        try:
            self.config = configparser.ConfigParser()
            self.config.read('./config.ini')
            self.global_config = self.config['globals']
            # self.server_ip = os.getenv("HOST_URI")
            self.server_ip = self.global_config['host']
            self.cloudamqp_config = self.config['CloudAMQP']
            # self.redis_dict = redis.Redis(host=os.getenv("REDIS_HOST"), port=os.getenv("REDIS_PORT"),
            #                               db=os.getenv("REDIS_DATABASE"))
            self.redis_config = self.config['Redis']
            self.redis_dict = redis.Redis(host=self.redis_config['redis_host'], port=self.redis_config['port'],
                                          db=self.redis_config['database'])
            self.print_count = 0
            CLOUDAMQP_URL = self.generate_cloud_amqp_url()
            # CLOUDAMQP_URL = os.getenv("CLOUDAMQP_URL")

            # self.url = CLOUDAMQP_URL
            self.url = os.environ.get('CLOUDAMQP_URL', CLOUDAMQP_URL)
            self.setup_mongo_operations()
            self.initialise_threaded_mongo_database()
            self.declare_DBQueue()

        except Exception as e:
            traceback.print_exc()

    def generate_cloud_amqp_url(self):
        cloud_amqp_config = self.cloudamqp_config
        username = cloud_amqp_config['username']
        password = cloud_amqp_config['password']
        cloud_url = cloud_amqp_config['url']
        url_default = f'amqps://{username}:{password}@{cloud_url}/{username}'
        return url_default

    def initialise_threaded_logger(self):
        DBThread = Thread(target=self.declare_LoggerQueue)
        DBThread.setDaemon(False)
        DBThread.start()

    def initialise_threaded_mongo_database(self):
        no_sql_db_thread = Thread(target=self.write_to_mongo)
        no_sql_db_thread.setDaemon(False)
        no_sql_db_thread.start()

    def declare_DBQueue(self):
        credentials = pika.PlainCredentials('MjphbXFwLXNnLTZ3cjMyajM0YzA3MzpMVEFJNXQ5a25zNzdwdUpvWHpFVVBjdVo=',
                                            'QkU4MzdDRkY2NTJDQ0FBMzdFNEQwRTBBMEI4RTBCQUQ2OERERTE3NToxNjc1MTcyMzcyMzkw')
        # parameters = pika.ConnectionParameters(credentials=credentials, heartbeat=0)
        self.params = pika.ConnectionParameters(host='amqp-sg-6wr32j34c073.me-central-1.amqp-0.net.mq.amqp.aliyuncs.com',
                                                credentials=credentials, heartbeat=0)
        self.connection = pika.BlockingConnection(self.params)
        self.channel = self.connection.channel()
        # self.DB_queue_name = os.getenv("WRITER_QUEUE")
        self.DB_queue_name = self.cloudamqp_config["writer_queue"]
        result = self.channel.queue_declare(queue=self.DB_queue_name)  # Declare a queue

        print(f' [*] Waiting for logs at {self.DB_queue_name}. To exit press CTRL+C')

        self.channel.basic_consume(
            queue=self.DB_queue_name, on_message_callback=self.DB_callback, auto_ack=True)
        self.channel.basic_qos(prefetch_count=1)
        self.channel.start_consuming()

    def setup_mongo_operations(self):
        self.initialise_mongo_attributes()
        self.initialise_mongo_connection()
        self.initialise_database_for_mongo()
        self.initialise_collections_for_mongodb()

    def initialise_mongo_attributes(self):
        self.mobile_driver_packet_collection = None
        self.gps_packet_collection = None
        self.drowsy_packet_collection = None
        self.face_recognition_packet_collection = None
        self.mobile_packet_collection = None
        self.online_packet_collection = None
        self.all_logs_collection = None
        self.metrics_packets_collection = None
        self.mongo_database_autilent = None
        self.mongo_client = None
        self.nosql_write_queue = Queue()

    # def initialise_mongo_connection(self):
    #     # mongo_config = self.config['MongoDB']
    #     self.mongo_client = MongoClient(f'mongodb://{os.getenv("HOST_URI")}:{os.getenv("MONGO_PORT")}/',
    #                                     username=os.getenv("MONGO_USER"),
    #                                     password=os.getenv("MONGO_PWD"),
    #                                     authSource=os.getenv("MONGO_DB"),
    #                                     authMechanism=os.getenv("MONGO_AUTH_MECH"))

    def initialise_mongo_connection(self):
        mongo_config = self.config['MongoDB']
        self.mongo_client = MongoClient(f'mongodb://{mongo_config["mongo_host"]}:{mongo_config["port"]}/',
                                        username=mongo_config["username"],
                                        password=mongo_config["password"],
                                        authSource=mongo_config["database"],
                                        authMechanism=mongo_config["auth_mechanism"])

    def initialise_database_for_mongo(self):
        self.mongo_database_autilent = self.mongo_client.autilent

    def initialise_collections_for_mongodb(self):

        self.online_packets = self.mongo_database_autilent.online_packets
        self.face_recognition = self.mongo_database_autilent.face_recognition
        self.location_packets = self.mongo_database_autilent.location_packets
        self.anomalies = self.mongo_database_autilent.anomalies
        self.vehicle_status = self.mongo_database_autilent.vehicle_status
        self.session_data = self.mongo_database_autilent.session_data
        # print("self.online_packets.find( ",self.online_packets.find().sort("packet_id",-1).limit(1)[0])
        # print("self.face_recognition.find( ",self.face_recognition.find().sort("packet_id",-1).limit(1)[0])
        # print("self.location_packets.find( ",self.location_packets.find().sort("packet_id",-1).limit(1)[0])
        # print("self.anomalies.find( ",self.anomalies.find().sort("packet_id",-1).limit(1)[0])

    def insert_anomaly_data(self, dictionary_of_packet, anomaly_type):
        dictionary_of_packet['anomaly_type'] = anomaly_type
        self.anomalies.insert_one(dictionary_of_packet)

    def get_location_from_coordinates(self, latitude, longitude):
        location = self.fetch_article(
            f"https://nominatim.openstreetmap.org/reverse?lat={latitude[:(latitude.index('.') + 7)]}&lon={longitude[0:(longitude.index('.') + 7)]}&format=json&addressdetails=1")
        if location != "N/A":
            location = str(location['display_name'].split(",")[
                           0]).replace("'", "")
        return location

    def get_location_name_from_coords(self, dictionary_of_packet):
        location = self.get_location_from_coordinates(
            dictionary_of_packet['payload']['latitude'], dictionary_of_packet['payload']['longitude'])
        return location

    def insert_gps_packet(self, dictionary_of_packet, location_name):
        dictionary_of_packet['payload']['location'] = location_name
        self.location_packets.insert_one(dictionary_of_packet)

    # Vehicle status updation functions
    def update_vehicle_status_with_online_time(self, dictionary_of_online_packet):
        self.vehicle_status.update_one(
            {'vehicleId': dictionary_of_online_packet['vehicleId']},
            {'$set': {
                'last_online': dictionary_of_online_packet['payload']['timeStamp'],
                'managerId': dictionary_of_online_packet['managerId']
            }
            }, upsert=True)

    def update_vehicle_status_with_location(self, dictionary_of_location_packet, location_name):
        self.vehicle_status.update_one(
            {'vehicleId': dictionary_of_location_packet['vehicleId']},
            {'$set': {
                'latitude': dictionary_of_location_packet['payload']['latitude'],
                'longitude': dictionary_of_location_packet['payload']['longitude'],
                'location': location_name,
                'location_time': dictionary_of_location_packet['payload']['timeStamp'],
                'current_speed': dictionary_of_location_packet['payload']['speed'],
                'vehicle_plate_no': dictionary_of_location_packet['payload']['plateNo'],
            }
            }, upsert=True)

    def update_vehicle_status_with_driver_info(self, dictionary_of_facerecognition_packet):
        self.vehicle_status.update_one(
            {'vehicleId': dictionary_of_facerecognition_packet['vehicleId']},
            {'$set': {
                'driver_id': dictionary_of_facerecognition_packet['payload']['driverId'],
                'auth_status': dictionary_of_facerecognition_packet['payload']['driverapproved'],
                'auth_status_time': dictionary_of_facerecognition_packet['payload']['timeStamp']
            }
            }, upsert=True)
    # Session data updating functions

    def get_previous_session_data_if_exists(self, vehilce_id, session_id, trip_id):
        previous_record = self.session_data.find_one(
            {
                'vehicle_id': vehilce_id,
                'session_id': session_id,
                'trip_id': trip_id
            },
        )
        if not previous_record:
            return None
        return previous_record

    def update_session_data(self, vehilce_id, session_id, trip_id, fields_to_update):
        self.session_data.update_one({
            'vehicle_id': vehilce_id,
            'session_id': session_id,
            'trip_id': trip_id
        }, {'$set': fields_to_update}, upsert=True)

    def update_session_info_with_location_info(self, dictionary_of_packet, location_name):
        previous_record = self.get_previous_session_data_if_exists(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'])
        if previous_record is None or previous_record.get('vehicle_route', None) is None:
            fields_to_update = {
                'vehicle_route': [
                    {
                        'latitude': dictionary_of_packet['payload']['latitude'],
                        'longitude': dictionary_of_packet['payload']['longitude'],
                        'address': location_name,
                        'speed': float(dictionary_of_packet['payload']['speed']),
                        'timestamp': dictionary_of_packet['payload']['timeStamp'],
                    }
                ],
                'max_speed': dictionary_of_packet['payload']['speed'],
                'avg_speed': dictionary_of_packet['payload']['speed'],
                'total_distance': dictionary_of_packet.get('payload').get('lastDistance', 0)
            }
        else:
            previous_record['vehicle_route'].append({
                'latitude': dictionary_of_packet['payload']['latitude'],
                'longitude': dictionary_of_packet['payload']['longitude'],
                'address': location_name,
                'speed': dictionary_of_packet['payload']['speed'],
                'timestamp': dictionary_of_packet['payload']['timeStamp'],
            })
            fields_to_update = {
                'vehicle_route': previous_record['vehicle_route'],
                'total_distance': float(previous_record['total_distance']) + float(dictionary_of_packet.get('payload').get('lastDistance', 0)),
                'max_speed': float(previous_record['max_speed']) if float(previous_record['max_speed']) > float(dictionary_of_packet['payload']['speed']) else float(dictionary_of_packet['payload']['speed']),
                'avg_speed': (float(previous_record['avg_speed'])*len(previous_record['vehicle_route'])+float(dictionary_of_packet['payload']['speed'])) / (len(previous_record['vehicle_route'])+1),
            }

        self.update_session_data(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'], fields_to_update)

    def update_session_info_with_online_info(self, dictionary_of_packet):
        previous_record = self.get_previous_session_data_if_exists(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'])
        if previous_record is None or previous_record.get('start_time', None) is None:

            fields_to_update = {
                'start_time': dictionary_of_packet.get('payload').get('timeStamp'),
                'drowsy_count': 0,
                'distracted_count': 0,
                'total_idle_time': 0,
                'trip_id': dictionary_of_packet.get('tripId')
            }
        else:
            fields_to_update = {
                'end_time': dictionary_of_packet.get('payload').get('timeStamp'),
                'trip_id': dictionary_of_packet.get('tripId')
            }
        self.update_session_data(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'], fields_to_update)

    def update_session_info_with_drowsy_info(self, dictionary_of_packet):

        previous_record = self.get_previous_session_data_if_exists(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'])
        if previous_record is None or previous_record.get('drowsy_count', None) is None:
            fields_to_update = {
                'drowsy_count': dictionary_of_packet.get('payload').get('drowsyCount', 0)
            }
        else:
            fields_to_update = {
                'drowsy_count': int(previous_record.get('drowsy_count'))+int(dictionary_of_packet.get('payload').get('drowsyCount', 0))
            }
        self.update_session_data(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'], fields_to_update)

    def update_session_info_with_distracted_info(self, dictionary_of_packet):

        previous_record = self.get_previous_session_data_if_exists(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'])
        if previous_record is None or previous_record.get('distracted_count', None) is None:
            fields_to_update = {
                'distracted_count': dictionary_of_packet.get('payload').get('distractedCount', 0)
            }
        else:
            fields_to_update = {
                'distracted_count': int(previous_record.get('distracted_count'))+int(dictionary_of_packet.get('payload').get('distractedCount', 0))
            }
        self.update_session_data(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'], fields_to_update)

    def update_session_info_with_idle_info(self, dictionary_of_packet):

        previous_record = self.get_previous_session_data_if_exists(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'])
        if previous_record is None or previous_record.get('total_idle_time', None) is None:
            fields_to_update = {
                'total_idle_time': dictionary_of_packet.get('payload').get('idleTime')
            }
        else:
            fields_to_update = {
                'total_idle_time': float(previous_record.get('total_idle_time'))+float(dictionary_of_packet.get('payload').get('idleTime', 0.0))
            }
        self.update_session_data(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'], fields_to_update)

    def update_session_info_with_driver_info(self, dictionary_of_packet):

        previous_record = self.get_previous_session_data_if_exists(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'])
        if previous_record is None or previous_record.get('driverapproved', None) is None:
            fields_to_update = {
                'drivers': [
                    {
                        'driver_id': dictionary_of_packet['payload']['driverId'],
                        'auth_status': dictionary_of_packet['payload']['driverapproved'],
                        'auth_status_time': dictionary_of_packet['payload']['timeStamp']
                    }
                ]
            }
        else:
            drivers = previous_record['drivers'].append(
                {
                    'driver_id': dictionary_of_packet['payload']['driverId'],
                    'auth_status': dictionary_of_packet['payload']['driverapproved'],
                    'auth_status_time': dictionary_of_packet['payload']['timeStamp']
                }
            )
            fields_to_update = {
                'drivers': drivers
            }
        self.update_session_data(
            dictionary_of_packet['vehicleId'], dictionary_of_packet['sessionId'], dictionary_of_packet['tripId'], fields_to_update)

    def write_to_mongo(self):
        while True:

            try:
                if self.nosql_write_queue.qsize():
                    current_packet = self.nosql_write_queue.get(block=False)
                    dictionary_of_packet = MessageToDict(current_packet)
                    type_of_packet = dictionary_of_packet.pop('type').lower()
                    if type_of_packet == "onlinepacket":
                        self.online_packets.insert_one(dictionary_of_packet)
                        self.update_vehicle_status_with_online_time(
                            dictionary_of_packet)
                        self.update_session_info_with_online_info(
                            dictionary_of_packet)
                    elif type_of_packet == "facerecognitionpacket":
                        self.face_recognition.insert_one(dictionary_of_packet)
                        self.update_vehicle_status_with_driver_info(
                            dictionary_of_packet)
                        self.update_session_info_with_driver_info(
                            dictionary_of_packet)
                        if dictionary_of_packet['payload']['driverapproved'].lower() == "unauthorized":
                            self.insert_anomaly_data(
                                dictionary_of_packet, "unauthorized_anomaly")
                    elif type_of_packet == "drowsypacket":
                        self.insert_anomaly_data(
                            dictionary_of_packet, "drowsy_anomaly")
                        self.update_session_info_with_drowsy_info(
                            dictionary_of_packet)
                    elif type_of_packet == "distractedpacket":
                        self.insert_anomaly_data(
                            dictionary_of_packet, "distracted_anomaly")
                        self.update_session_info_with_distracted_info(
                            dictionary_of_packet)
                    elif type_of_packet == "mobilepacket":
                        self.insert_anomaly_data(
                            dictionary_of_packet, "mobile_anomaly")
                    elif type_of_packet == "gpspacket":
                        location_name = self.get_location_name_from_coords(
                            dictionary_of_packet)
                        self.insert_gps_packet(
                            dictionary_of_packet, location_name)
                        self.update_vehicle_status_with_location(
                            dictionary_of_packet, location_name)
                        self.update_session_info_with_location_info(
                            dictionary_of_packet, location_name)
                    elif type_of_packet == "idlepacket":
                        self.insert_anomaly_data(
                            dictionary_of_packet, "idle_anomaly")
                        self.update_session_info_with_idle_info(
                            dictionary_of_packet)

            except Exception as e:
                traceback.print_exc()

    def add_packet_to_mongo_queue(self, packet):
        self.nosql_write_queue.put(packet)

    def DB_callback(self, ch, method, properties, body):
        dbPacket = Packets_pb2.DBPacket().FromString(body)

        try:
            self.add_packet_to_mongo_queue(dbPacket)
            self.print_count += 1
            if self.print_count % 300 == 0:
                print("Adding packer number: ", self.print_count)
        except:
            print("error Writing to Mongo")
            traceback.print_exc()

    def extract_article_content(self, url):
        response = requests.post(url)
        if response.status_code == 200:
            response = response.json()
            if 'error' in response.keys():
                response = 'N/A'
            return response
        return "N/A"

    def fetch_article(self, url):
        content = self.redis_dict.get(url)
        if content is None:
            content = self.extract_article_content(url)
            self.redis_dict.set(url, json.dumps(content))
        else:
            content = json.loads(content)
        return content

    def parse_location_response(self, location_json):
        if ('address' in dict(location_json).keys()) and ('road' in dict(location_json['address']).keys()):
            if location_json['address']['road'] != '':
                location_to_return = location_json['address']['road']
        else:
            split_names = location_json['display_name'].split(",")
            location_to_return = str(
                split_names[0] + split_names[1]).replace("'", "")
        return location_to_return

    def is_vehicle_moving(self, speed):
        try:
            speedType = type(speed)
            if (speedType == int):
                new_speed = speed
                return new_speed
            elif (speedType == str):
                new_speed = int(float(speed))
                return new_speed
            elif (speedType == float):
                new_speed = speed
                return new_speed
            else:
                new_speed = int(float(speed))
                return new_speed
        except:
            traceback.print_exc()

    def get_vehicle_all_coords(self, vehicle_id):

        vehicle_all_coords = self.mongo_client['location_packet'].find({"payload.plateNo": vehicle_id}).sort("epoch",
                                                                                                             -1)
        coords_vehicle_arr = []

        for vehicle in vehicle_all_coords:
            coords_vehicle_arr.append(vehicle)

        return coords_vehicle_arr

    def save_vehicle_distance(self, vehicle_id):

        vehicle_coords = self.get_vehicle_all_coords(vehicle_id)
        total_distance = 0

        for i in range(1, len(vehicle_coords)):
            point1 = float(vehicle_coords[i - 1]['payload']['latitude']), float(
                vehicle_coords[i - 1]['payload']['longitude'])
            point2 = float(vehicle_coords[i]['payload']['latitude']), float(
                vehicle_coords[i]['payload']['longitude'])

            total_distance += self.haversine_distance(point1, point2)

        return total_distance

    def haversine_distance(self, point1, point2):
        radius_of_earth = 6371.0710  # in KMs
        # point in radians
        rlat1 = point1[0] * (math.pi / 180)
        rlat2 = point2[0] * (math.pi / 180)

        difflat = rlat2 - rlat1  # Radian difference (latitudes)
        # Radian difference (longitudes)
        difflon = (point2[1] - point1[1]) * (math.pi / 180)

        distance_in_km = 2 * radius_of_earth * math.asin(math.sqrt(
            math.sin(difflat / 2) * math.sin(difflat / 2) + math.cos(rlat1) * math.cos(rlat2) * math.sin(
                difflon / 2) * math.sin(difflon / 2)))
        return distance_in_km


if __name__ == '__main__':
    while True:
        try:
            DB = Database()
        except Exception as e:
            traceback.print_exc()
