import os

key_value = {"HOST_URI":"3.17.120.211",
"PG_PORT":"54321",
"PG_USER":"server",
"PG_PWD":"ByteCorp!@#",
"PG_DB":"Drift",
"MONGO_USER":"server",
"MONGO_PWD":"Qf?dpWT2Kd69Qz47YzFa",
"MONGO_DB":"admin",
"MONGO_PORT":"27017",
"MONGO_AUTH_MECH":"SCRAM-SHA-256",
"AWS_ACCESS_KEY":"AKIA4LIKQYIECLOSUVKR",
"AWS_SECRET_KEY":'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',
"AWS_BUCKET_NAME":"new-autilent",
"AWS_REGION":"us-east-2",
"AWS_IMAGE_KEY":"vehicles/",
"LOCAL_HOST_AUTH":"http://3.17.120.211:8080"}

for key, value in key_value.items():
    print(key, value)
    os.environ[key] = value
    print(os.environ.get(key))