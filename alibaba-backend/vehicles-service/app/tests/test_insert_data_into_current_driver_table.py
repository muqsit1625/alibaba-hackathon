import sys
sys.path.append("/Users/muhammadibrahimchippa/PycharmProjects/Autilent-MSBackend-v1/vehicles_service/app")

from vehicles_service.app.api.db_manager import admin_for_vehicles as afv

print(afv.add_vehicle_info_to_current_driver_table("1ed3f29a-c6af-6352-8f22-0242ac140006", "-"))