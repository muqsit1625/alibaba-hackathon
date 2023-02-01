
class Devices_Queries:
    
    def get_query(self):
        return '''
            SELECT 
            devices.device_id, imei, devices.phone_number, serial_number, onboarding_date, batch_number, os_version, allocation_status, devices.manager_id, concat(users.first_name,' ',users.last_name) as manager_name, devices.vehicle_id, vehicles.vehicle_plate_no, serial_number_image, devices.created_at, devices.updated_at 
            FROM public.devices 
            LEFT JOIN public.users ON devices.manager_id = users.user_id
            LEFT JOIN public.vehicles ON devices.vehicle_id = vehicles.vehicle_id;
        '''

    def get_single_device_query(self):
        return '''
            SELECT 
            devices.device_id, imei, devices.phone_number, serial_number, onboarding_date, batch_number, os_version, allocation_status, devices.manager_id, concat(users.first_name,' ',users.last_name) as manager_name, devices.vehicle_id, vehicles.vehicle_plate_no, serial_number_image, devices.created_at, devices.updated_at 
            FROM public.devices 
            LEFT JOIN public.users ON devices.manager_id = users.user_id
            LEFT JOIN public.vehicles ON devices.vehicle_id = vehicles.vehicle_id
            WHERE devices.device_id = %s;
        '''

    def get_single_device_by_serial_query(self):
        return '''
            SELECT 
            devices.device_id, imei, devices.phone_number, devices.serial_number, onboarding_date, batch_number, os_version, allocation_status, devices.manager_id, concat(users.first_name,' ',users.last_name) as manager_name, devices.vehicle_id, vehicles.vehicle_plate_no, serial_number_image, devices.created_at, devices.updated_at
            FROM public.devices 
            LEFT JOIN public.users ON devices.manager_id = users.user_id
            LEFT JOIN public.vehicles ON devices.vehicle_id = vehicles.vehicle_id
            WHERE devices.serial_number = %s;
        '''


    def filter_query(self):
        return '''
            SELECT 
            devices.device_Id, Imei, devices.phone_number, serial_number, onboarding_date, batch_number, os_version, allocation_status, devices.manager_id, concat(users.first_name,' ',users.last_name) as manager_name, devices.vehicle_id, vehicles.vehicle_plate_no, serial_number_image, devices.created_at, devices.updated_at 
            FROM public.devices 
            LEFT JOIN public.users ON devices.manager_id = users.user_id
            LEFT JOIN public.vehicles ON devices.vehicle_id = vehicles.vehicle_id
            WHERE devices.manager_id = %s;
        '''

    def allocate_device(self):
        return '''
            UPDATE public.devices 
            SET allocation_status = true, vehicle_id = %(vehicle_id)s
            WHERE device_id = %(device_id)s;


            UPDATE public.vehicles
            SET device_id = %(device_id)s 
            WHERE vehicle_id = %(vehicle_id)s;
        '''

    def deallocate_device(self):
        return '''
            UPDATE public.devices 
            SET allocation_status = false, vehicle_id = NULL
            WHERE device_id = %s;

            UPDATE public.vehicles
            SET device_id = NULL 
            WHERE device_id = %s;
        '''

    def add_device_query(self):
        return '''
            INSERT INTO public.devices
            (device_id, imei, phone_number, serial_number, onboarding_date, batch_number, os_version, allocation_status, manager_id, vehicle_id, serial_number_image)
            VALUES 
            (%(device_id)s, %(imei)s, %(phone_number)s, %(serial_number)s, %(onboarding_date)s, %(batch_number)s, %(os_version)s, %(allocation_status)s, %(manager_id)s, %(vehicle_id)s, %(serial_number_image)s)
            RETURNING device_id;
        '''

    def delete_single_query(self):
        return '''
            WITH 
            var as ((select %s as user_id, %s as rec_id1, %s as device_id)),
            delete_devices AS
            (DELETE FROM public.devices WHERE devices.device_id = (SELECT device_id FROM var) RETURNING *)
            
            INSERT INTO recycle_bin (record_id, relation_table, delete_by, json)
            SELECT rec_id1, 'devices', user_id, (SELECT row_to_json(delete_devices) FROM delete_devices) FROM var;

            '''

    def update_single_query(self):
        return '''
            UPDATE public.devices
            SET
            imei = %(imei)s,
            phone_number = %(phone_number)s,
            serial_number = %(serial_number)s,
            onboarding_date = %(onboarding_date)s,
            batch_number = %(batch_number)s,
            os_version = %(os_version)s,
            allocation_status = %(allocation_status)s,
            manager_id = %(manager_id)s,
            vehicle_id = %(vehicle_id)s
            WHERE device_id = %(device_id)s;
        '''


query = Devices_Queries()