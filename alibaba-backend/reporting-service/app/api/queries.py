
class Anomalies_Queries:

    def get_one_vehicle_of_manager(self):
        return '''
                SELECT * FROM vehicles WHERE vehicles.manager_id = %(user_id)s AND vehicles.vehicle_Id = %(vehicle_plate_no)s
        '''

    def get_one_driver_of_manager(self):
        return '''
                SELECT * FROM drivers WHERE drivers.manager_id = %(user_id)s AND drivers.driver_id = %(driver_id)s
        '''

    def get_driver(self):
        return '''
                SELECT * FROM drivers where drivers.driver_id = %(driver_id)s
        '''

    def get_active_trip(self):
        return '''
            SELECT * FROM public.trips WHERE vehicle_id = %(vehicle_id)s AND ongoing = TRUE
        '''

    def add_new_trip(self):
        return '''
            INSERT INTO public.trips (trip_id, vehicle_id, trip_start)
            VALUES (%(trip_id)s, %(vehicle_id)s, %(trip_start)s)
        '''

    def update_trip(self):
        return '''
            UPDATE public.trips SET trip_end = %(trip_end)s, ongoing = %(ongoing)s
            WHERE trip_id = %(trip_id)s
        '''

    def get_trip_ids_in_time_range(self):
        return '''
            SELECT trip_id FROM public.trips WHERE trip_end <= %(trip_end)s and trip_start >= %(trip_start)s and vehicle_id = %(vehicle_id)s
        '''


query = Anomalies_Queries()
