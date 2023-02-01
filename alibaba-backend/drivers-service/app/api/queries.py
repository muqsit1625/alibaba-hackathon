class Manager_Queries:

    def get_query(self):
        return '''
            SELECT 
            driver_id, driver_first_name, driver_last_name, drivers.cnic, license_number, drivers.phone_number, drivers.address, driver_media_url, drivers.vehicle_id, vehicle_plate_no, drivers.manager_id, concat(users.first_name,' ',users.last_name) as manager_name
            FROM public.drivers
            LEFT JOIN public.users ON drivers.manager_id = users.user_id
            LEFT JOIN public.vehicles ON drivers.vehicle_id = vehicles.vehicle_id
            WHERE drivers.manager_id = %s;
        '''

    def get_driver_name_and_id_query(self):
        return '''
            SELECT 
            driver_id, driver_first_name, driver_last_name
            FROM public.drivers
            LEFT JOIN public.users ON drivers.manager_id = users.user_id
            LEFT JOIN public.vehicles ON drivers.vehicle_id = vehicles.vehicle_id
            WHERE drivers.manager_id = %s;
        '''


    def get_single_query(self):
        return '''
            SELECT 
            driver_id, driver_first_name, driver_last_name, drivers.cnic, license_number, drivers.phone_number, drivers.address, driver_media_url, drivers.vehicle_id, vehicle_plate_no, drivers.manager_id, concat(users.first_name,' ',users.last_name) as manager_name
            FROM public.drivers
            LEFT JOIN public.users ON drivers.manager_id = users.user_id
            LEFT JOIN public.vehicles ON drivers.vehicle_id = vehicles.vehicle_id
            WHERE driver_id = %s AND drivers.manager_id = %s;
        '''


    def add_new_query(self):
        return '''
            INSERT INTO public.drivers
            (driver_id, driver_first_name, driver_last_name, cnic, license_number, phone_number, address, driver_media_url, vehicle_id, manager_id)
            VALUES
            (%(driver_id)s, %(driver_first_name)s, %(driver_last_name)s, %(cnic)s, %(license_number)s, %(phone_number)s, %(address)s, %(driver_media_url)s, %(vehicle_id)s, %(manager_id)s);
        '''

    def delete_single_query(self):
        return '''
            WITH 
            var as ((select %s as d_id, %s as rec_id1, %s as m_id)),
            delete_driver AS
            (DELETE FROM drivers WHERE drivers.driver_id = (SELECT d_id FROM var) and drivers.manager_id = (SELECT m_id FROM var) RETURNING *)
            
            INSERT INTO recycle_bin (record_id, relation_table, delete_by, json)
            SELECT rec_id1, 'drivers', m_id, (SELECT row_to_json(delete_driver) FROM delete_driver) FROM var;
            '''

    def update_single_query(self):
        return '''
            UPDATE public.drivers SET 
            driver_first_name = %(driver_first_name)s, driver_last_name = %(driver_last_name)s, cnic = %(cnic)s, license_number = %(license_number)s, phone_number= %(phone_number)s, address = %(address)s, vehicle_id = %(vehicle_id)s, manager_id = %(manager_id)s, driver_media_url=%(driver_media_url)s
            WHERE driver_id = %(driver_id)s and manager_id = %(manager_id)s;
        '''


    def assign_vehicle_query(self):
        return '''
            UPDATE public.drivers SET 
            vehicle_id = %(vehicle_id)s
            WHERE driver_id = %(driver_id)s and manager_id = %(manager_id)s;
        '''


    def unassign_vehicle_query(self):
        return '''
            UPDATE public.drivers SET 
            vehicle_id = NULL
            WHERE driver_id = %(driver_id)s and manager_id = %(manager_id)s;
        '''


query = Manager_Queries()