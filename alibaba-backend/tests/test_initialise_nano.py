import json
import pickle

import numpy as np
import requests


def create_driver_embedding_pickle_file(driver_id, name, embedding,
                                        emb_dir="/Users/muhammadibrahimchippa/PycharmProjects/Autilent-MSBackend-v1/tests"):
    f = open(f"{emb_dir}/{driver_id}_{name}.pkl", "wb")
    pickle.dump(embedding, f)
    f.close()


def parse_driver_details(drivers_info):
    for driver in drivers_info:
        driver_id = driver['driver_id']
        name = driver['driver_first_name']
        embedding = np.array(driver['embedding'])
        print(f"shape: {embedding.shape}")

        # embedding = np.frombuffer(embedding, dtype=np.float32)

        # image_channel = 1
        # image_width = 1
        # image_height = 256
        # embedding = np.reshape(embedding, (image_channel, image_width, image_height))
        create_driver_embedding_pickle_file(driver_id, name, embedding)


base_url = "http://192.168.0.100:8080"
SERIAL_NUMBER = "14227210862340808106"
DEVICES_URL = base_url + f"/api/v1/devices/get_device_by_serial/{SERIAL_NUMBER}"
VEHICLE_URL = base_url + "/api/v1/vehicles/get_vehicle/"
DRIVER_URL = base_url + "/api/v1/drivers/embeddings_for_drivers"

headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hbmFsQGdtYWlsLmNvbSIsInVzZXJfaWQiOiIxZWQyMWVkNy0xNzk2LTY5OWUtOTAyZC0wMjQyYzBhOGEwMDIiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJleHAiOjE2NjQ5ODMzODR9.IeCkhoWGEu-6ArdqBLSMZ0JZkEahZ3IgFHivR41pj0U"}

response = requests.request("GET", url=DEVICES_URL, headers=headers)
if response.status_code == 201:
    vehicle_id_to_use = response.json()['result']["vehicle_id"]
    print(vehicle_id_to_use)
    response = requests.request("GET", url=VEHICLE_URL + vehicle_id_to_use, headers=headers)
    vehicle_details = response.json()['result']
    drivers = vehicle_details['drivers']
    print(drivers)
    drivers_info = requests.request("GET", url=DRIVER_URL, data=json.dumps(drivers), headers=headers)
    print(drivers_info.json())
    parse_driver_details(drivers_info.json()['result'])
else:
    print("Invalid response", response.status_code, response.text)
