import json
import os

import numpy as np
import sys

import requests

from drivers_service.app.api.utils import generate_s3_url_for_object

# sys.path.append("/Users/muhammadibrahimchippa/PycharmProjects/Autilent-MSBackend-v1/drivers_service/app/api")
from managers_service.app.api.utils import generate_s3_url

key_value = {"HOST_URI": "3.17.120.211",
             "PG_PORT": "54321",
             "PG_USER": "server",
             "PG_PWD": "ByteCorp!@#",
             "PG_DB": "Drift",
             "MONGO_USER": "server",
             "MONGO_PWD": "Qf?dpWT2Kd69Qz47YzFa",
             "MONGO_DB": "admin",
             "MONGO_PORT": "27017",
             "MONGO_AUTH_MECH": "SCRAM-SHA-256",
             "AWS_ACCESS_KEY": "AKIA4LIKQYIECLOSUVKR",
             "AWS_SECRET_KEY": '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',
             "AWS_BUCKET_NAME": "new-autilent",
             "AWS_REGION": "us-east-2",
             "AWS_IMAGE_KEY": "drivers/",
             "LOCAL_HOST_AUTH": "http://3.17.120.211:8080"}

for key, value in key_value.items():
    os.environ[key] = value

form_data = {}

img = np.array((4, 3))
print(img)
url_object = generate_s3_url_for_object('drivers/test.json')
print(url_object)
# params = url_object['result'].split('?')[-1].split('&')
# for p in params:
#     x = p.split('=')
#     form_data[x[0]] = x[1].replace('%2F', '')
#
form_data = url_object['result']['fields']
# form_data['key'] = 'drivers/test.json'
print(form_data)
form_data['file'] = json.dumps(img.tolist())
response = requests.request("POST", 'https://new-autilent.s3.amazonaws.com/', files=form_data)
print(response.status_code)
print(response.text)
