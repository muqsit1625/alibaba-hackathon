
class Manager_Queries:
    
    def get_query(self):
        return '''
            SELECT 
            manager_id, first_name, last_name, email, phone_number, company_name, dob, cnic, address, image, users.created_at, users.updated_at, face_sides, cnic_images
            FROM users            
            RIGHT JOIN fleet_managers ON users.user_id = fleet_managers.manager_id;
        '''

    def get_count_data_query(self):
        return '''
            WITH managers AS
            (SELECT COUNT(*) as total_managers FROM public.fleet_managers),
            vehicles AS
            (SELECT COUNT(*) as total_vehicles FROM public.vehicles),
            devices AS
            (SELECT COUNT(*) as total_devices FROM public.devices),
            allocated_devices AS
            (SELECT COUNT(*) as total_allocated_devices FROM public.devices WHERE allocation_status = true)

            SELECT * FROM managers, vehicles, devices, allocated_devices;
        '''


    def get_single_query(self):
        return '''
            SELECT 
            manager_id, first_name, last_name, email, phone_number, company_name, dob, cnic, address, image, users.created_at, users.updated_at, face_sides, cnic_images
            FROM users            
            RIGHT JOIN fleet_managers ON users.user_id = fleet_managers.manager_id 
            WHERE manager_id = %s;
        '''

    def get_user(self):
        return '''
            SELECT * FROM public.users 
            WHERE email = %s;
        '''

    def add_new_query(self):
        return '''
            INSERT INTO public.users
            (user_id, first_name, last_name, email, phone_number)
            VALUES
            (%(manager_id)s, %(first_name)s, %(last_name)s, %(email)s, %(phone_number)s);
            
            INSERT INTO public.fleet_managers
            (manager_id, company_name, dob, cnic, address, image, face_sides, cnic_images)
            VALUES 
            (%(manager_id)s, %(company_name)s, %(dob)s, %(cnic)s, %(address)s, %(image)s, %(face_sides)s, %(cnic_images)s);

            INSERT INTO public.password
            (password_id, password, created_by, user_id)
            VALUES
            (%(password_id)s, %(hashPassword)s, %(created_by)s, %(manager_id)s);

        '''

    def delete_single_query(self):
        return '''
            WITH 
            var as ((select %s as m_id, %s as rec_id1,%s as admin_id)),
            delete_users AS
            (DELETE FROM users WHERE users.user_id = (SELECT m_id FROM var) RETURNING *)
            
            INSERT INTO recycle_bin (record_id, relation_table, delete_by, json)
            SELECT rec_id1, 'users', admin_id, (SELECT row_to_json(delete_users) FROM delete_users) FROM var;



            WITH 
            var as ((select %s as m_id, %s as rec_id2, %s as admin_id)),
            delete_managers AS
            (DELETE FROM fleet_managers WHERE fleet_managers.manager_id = (SELECT m_id FROM var) RETURNING *)
            
            INSERT INTO recycle_bin (record_id, relation_table, delete_by, json)
            SELECT rec_id2, 'fleet_managers', admin_id, (SELECT row_to_json(delete_managers) FROM delete_managers) FROM var; 


            WITH 
            var as ((select %s as m_id, %s as rec_id3, %s as admin_id)),
            delete_password AS
            (DELETE FROM password WHERE password.user_id = (SELECT m_id FROM var) RETURNING *)
            
            INSERT INTO recycle_bin (record_id, relation_table, delete_by, json)
            SELECT rec_id3, 'password', admin_id, (SELECT row_to_json(delete_password) FROM delete_password) FROM var; 
     
            '''

    def update_single_query(self):
        return '''
            UPDATE public.users SET 
            first_name = %(first_name)s, last_name = %(last_name)s, email = %(email)s , phone_number= %(phone_number)s
            WHERE user_id = %(manager_id)s;

            UPDATE public.fleet_managers SET
            company_name = %(company_name)s, dob = %(dob)s, cnic=%(cnic)s, address = %(address)s
            WHERE manager_id = %(manager_id)s;
        '''
    def get_warehouse_location(self):
        return '''
            SELECT warehouse_lattitude, warehouse_longitude
            FROM public.fleet_managers
            WHERE manager_id = %(manager_id)s;
        '''
    def update_warehouse_location(self):
        return '''
            UPDATE public.fleet_managers SET 
            warehouse_lattitude = %(latitude)s, warehouse_longitude = %(longitude)s
            WHERE manager_id = %(manager_id)s;
        '''


query = Manager_Queries()