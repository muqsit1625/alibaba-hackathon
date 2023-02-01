fleet_manager = "fleet_manager"
super_admin = "super_admin"


class Trip_Queries:

    def get_active_trip(self):
        return '''
            SELECT * FROM public.trips WHERE vehicle_id = %(vehicle_id)s AND ongoing = TRUE
        '''

    def get_trip_ids_in_time_range(self):
        return '''
            SELECT trip_id FROM public.trips WHERE trip_end <= %(trip_end)s and trip_start >= %(trip_start)s and vehicle_id = %(vehicle_id)s
        '''
    def get_last_completed_trip(self):
        return '''
            SELECT * FROM public.trips
            WHERE ongoing = FALSE AND associated_sessions_count = 0
            ORDER BY trip_end ASC
        '''
    def update_trip_with_session_count(self):
        return '''
            UPDATE public.trips SET associated_sessions_count = %(session_count)s
            WHERE trip_id = %(trip_id)s
            '''

query = Trip_Queries()
