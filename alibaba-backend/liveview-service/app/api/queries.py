class Liveview_Queries:

    def get_vehicle_details(self):
        return '''
                SELECT vehicles.vehicle_id, vehicle_plate_no, vehicle_image, 
                vehicles.manager_id, vehicles.device_id, serial_number,
                allocation_status
                FROM vehicles 
                INNER JOIN devices ON vehicles.device_id = devices.device_id
                WHERE vehicles.vehicle_plate_no = %s;
        '''

    def get_all_drivers_of_vehicle(self):
        return '''                
                SELECT drivers.driver_id, drivers.driver_first_name, drivers.driver_last_name,
                 drivers.driver_media_url, drivers.vehicle_id, drivers.manager_id 
                 FROM drivers WHERE drivers.vehicle_id = %(vehicle_id)s;
        '''


query = Liveview_Queries()
