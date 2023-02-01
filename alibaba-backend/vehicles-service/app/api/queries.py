fleet_manager = "fleet_manager"
super_admin = "super_admin"


class Vehicles_Queries:

    def get_query(self, user):
        if user['role'] == super_admin:
            return '''
                WITH all_vehicles as 
                        (SELECT 
                            vehicles.vehicle_id, vehicle_plate_no, engine_no, chassis_no, color, make_model, weight, number_of_tires, vehicle_image, vehicles.manager_id, concat(users.first_name,' ',users.last_name) as manager_name, devices.device_id, devices.imei
                            FROM public.vehicles
                            LEFT JOIN public.users ON vehicles.manager_id = users.user_id
                            LEFT JOIN public.devices ON vehicles.device_id = devices.device_id
                        ),
                    all_drivers as
                        (SELECT obj.vehicle_id, json_agg(obj) AS drivers FROM 
                            (Select * FROM drivers) AS obj GROUP BY obj.vehicle_id
                        )

                SELECT *, all_vehicles.vehicle_id FROM all_vehicles LEFT JOIN all_drivers ON all_vehicles.vehicle_id = all_drivers.vehicle_id;
            '''
        else:
            return '''
                WITH all_vehicles as 
                        (SELECT 
                            vehicles.vehicle_id, vehicle_plate_no, engine_no, chassis_no, color, make_model, weight, number_of_tires, vehicle_image, vehicles.manager_id, concat(users.first_name,' ',users.last_name) as manager_name, devices.device_id, devices.imei
                            FROM public.vehicles
                            LEFT JOIN public.users ON vehicles.manager_id = users.user_id
                            LEFT JOIN public.devices ON vehicles.device_id = devices.device_id
                            WHERE vehicles.manager_id = %(user_id)s
                        ),
                    all_drivers as
                        (SELECT obj.vehicle_id, json_agg(obj) AS drivers FROM 
                            (Select * FROM drivers) AS obj GROUP BY obj.vehicle_id
                        )

                SELECT *, all_vehicles.vehicle_id FROM all_vehicles LEFT JOIN all_drivers ON all_vehicles.vehicle_id = all_drivers.vehicle_id LIMIT 10 OFFSET %(offset)s;
                
                
            '''

    def get_vehicle_license_plate_query(self, user):
        return '''
                    SELECT
                    vehicle_id, vehicle_plate_no
                    FROM public.vehicles
                    WHERE vehicles.manager_id = %(user_id)s
                '''

    def add_new_query(self):
        return '''
            INSERT INTO public.vehicles
            (vehicle_id,vehicle_plate_no, engine_no, chassis_no, color, make_model, weight, number_of_tires, vehicle_image, manager_id, device_id)
            VALUES
            (%(vehicle_id)s, %(vehicle_plate_no)s, %(engine_no)s, %(chassis_no)s, %(color)s, %(make_model)s, %(weight)s, %(number_of_tires)s, %(vehicle_image)s, %(manager_id)s, %(device_id)s)
            RETURNING vehicle_id;
        '''

    def update_vehicle(self, user):
        if user['role'] == super_admin:
            return '''
                UPDATE public.vehicles SET 
                vehicle_plate_no = %(vehicle_plate_no)s, engine_no = %(engine_no)s, chassis_no = %(chassis_no)s, color = %(color)s, make_model =  %(make_model)s, weight = %(weight)s, number_of_tires = %(number_of_tires)s, vehicle_image = %(vehicle_image)s,
                manager_id = %(manager_id)s, device_id = %(device_id)s
                WHERE vehicle_id = %(vehicle_id)s;
            '''
        else:
            return '''
                UPDATE public.vehicles SET 
                color = %(color)s, weight = %(weight)s
                WHERE vehicle_id = %(vehicle_id)s AND manager_id = %(user_id)s;
            '''

    def get_single_vehicle(self, user):
        if user['role'] == super_admin:
            return '''
                WITH all_vehicles as 
                        (SELECT 
                            vehicles.vehicle_id, vehicle_plate_no, engine_no, chassis_no, color, make_model, weight, number_of_tires, vehicle_image, vehicles.manager_id, concat(users.first_name,' ',users.last_name) as manager_name, devices.device_id, devices.imei
                            FROM public.vehicles
                            LEFT JOIN public.users ON vehicles.manager_id = users.user_id
                            LEFT JOIN public.devices ON vehicles.device_id = devices.device_id
                            WHERE vehicles.vehicle_id = %(vehicle_id)s
                        ),
                    all_drivers as
                        (SELECT obj.vehicle_id, json_agg(obj) AS drivers FROM 
                            (Select * FROM drivers) AS obj GROUP BY obj.vehicle_id
                        )

                SELECT *,all_vehicles.vehicle_id FROM all_vehicles LEFT JOIN all_drivers ON all_vehicles.vehicle_id = all_drivers.vehicle_id;
            '''
        else:
            return '''
                WITH all_vehicles as 
                        (SELECT 
                            vehicles.vehicle_id, vehicle_plate_no, engine_no, chassis_no, color, make_model, weight, number_of_tires, vehicle_image, vehicles.manager_id, concat(users.first_name,' ',users.last_name) as manager_name, devices.device_id, devices.imei
                            FROM public.vehicles
                            LEFT JOIN public.users ON vehicles.manager_id = users.user_id
                            LEFT JOIN public.devices ON vehicles.device_id = devices.device_id
                            WHERE vehicles.vehicle_id = %(vehicle_id)s AND vehicles.manager_id = %(user_id)s
                        ),
                    all_drivers as
                        (SELECT obj.vehicle_id, json_agg(obj) AS drivers FROM 
                            (Select * FROM drivers) AS obj GROUP BY obj.vehicle_id
                        )

                SELECT *, all_vehicles.vehicle_id FROM all_vehicles LEFT JOIN all_drivers ON all_vehicles.vehicle_id = all_drivers.vehicle_id;
            '''

    def delete_single_query(self):
        return '''
            WITH 
            var as ((select %s as v_id, %s as rec_id)),
            delete_vehicles AS
            (DELETE FROM public.vehicles WHERE vehicle_id = (SELECT v_id from var) RETURNING *)
            
            INSERT INTO recycle_bin (record_id, relation_table, delete_by, json)
            SELECT rec_id, 'vehicles', v_id, (SELECT row_to_json(delete_vehicles) FROM delete_vehicles) FROM var;
            '''

    def add_new_order(self):
        return '''
            INSERT INTO public.orders
            (order_id, order_data, manager_id, request_type)
            VALUES
            (%(order_id)s, %(order_data)s, %(manager_id)s, %(request_type)s)
            RETURNING order_id;
        '''

    def add_delete_vehicle_order(self):
        return '''
            INSERT INTO public.orders
            (order_id, order_data, manager_id, request_type)
            VALUES
            (%(order_id)s, %(order_data)s, %(manager_id)s, %(request_type)s)
            RETURNING order_id;
        '''

    def get_single_vehicle_by_plateno(self):
        return '''
            
            SELECT 
                vehicles.vehicle_id, vehicle_plate_no, engine_no, chassis_no, color, make_model, weight, number_of_tires, vehicle_image, vehicles.manager_id
                FROM public.vehicles
                WHERE vehicles.vehicle_plate_no = %(vehicle_plate_no)s;
                    
        '''

    def get_single_vehicle_by_id(self):
        return '''
            
            SELECT 
                vehicles.vehicle_id, vehicle_plate_no, engine_no, chassis_no, color, make_model, weight, number_of_tires, vehicle_image, vehicles.manager_id
                FROM public.vehicles
                WHERE vehicles.vehicle_id = %(vehicle_id)s;
            '''

    def add_to_current_driver_table(self):
        return """
            INSERT INTO public.current_driver(vehicle_id, current_key) 
            values(%(vehicle_id)s, %(current_key)s);
        """

    def update_to_current_driver_table(self):
        return """
            UPDATE public.current_driver SET current_key = %(current_key)s, created_at=%(created_at)s
            WHERE vehicle_id = %(vehicle_id)s;
        """

    def get_from_current_driver_table(self):
        return """
            SELECT * FROM public.current_driver 
            WHERE vehicle_id = %(vehicle_id)s;
        """

    def get_vehicles_by_driver_id(self):
        return '''
                WITH all_vehicles as 
                        (SELECT 
                            vehicles.vehicle_id, vehicle_plate_no, engine_no, chassis_no, color, make_model, weight, number_of_tires, vehicle_image, vehicles.manager_id, concat(users.first_name,' ',users.last_name) as manager_name
                            FROM public.vehicles
                            LEFT JOIN public.users ON vehicles.manager_id = users.user_id
                            WHERE vehicles.manager_id = %(user_id)s
                        ),
                    all_drivers as
                        (SELECT obj.vehicle_id, json_agg(obj) AS drivers FROM 
                            ( Select * FROM drivers WHERE driver_id = %(driver_id)s ) AS obj GROUP BY obj.vehicle_id
                        )

                SELECT *, all_vehicles.vehicle_id FROM all_vehicles LEFT JOIN all_drivers ON all_vehicles.vehicle_id = all_drivers.vehicle_id;
                
                
            '''


query = Vehicles_Queries()
