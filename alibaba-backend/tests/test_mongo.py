from time import time
from pymongo import MongoClient
import time


mongo = MongoClient('mongodb://server:Qf%3FdpWT2Kd69Qz47YzFa@3.17.120.211:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false')
m_db = mongo['autilent']
online_db, location_db = m_db['online_packets'], m_db['location_packets']
vehicle_status = list(online_db.find({"vehicle_id" : "ABC-012"}))
print(f"Length of cursor: {len(vehicle_status)}")

print([x['payload']['epoch'] for x in vehicle_status])
print(time.time())
