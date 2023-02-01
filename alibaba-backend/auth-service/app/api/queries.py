
class Auth_Queries:

    def add_super_admin(self):
        return '''
            INSERT INTO public.users
            (user_id, first_name, last_name, email, phone_number)
            VALUES
            (%(admin_id)s, %(first_name)s, %(last_name)s, %(email)s, %(phone_number)s);

            INSERT INTO public.super_admins 
            (admin_id)
            VALUES
            (%(admin_id)s);

            INSERT INTO public.password
            (password_id, password, created_by, user_id)
            VALUES
            (%(password_id)s, %(password)s, %(admin_id)s, %(admin_id)s);
        '''

    def add_login_attempt(self):
        return '''
            INSERT INTO login_attempt 
            (login_attempt_id, browser_type, success, password, user_id)
            VALUES
            (%s, %s, %s, %s, %s);
        '''

    def get_user(self):
        return '''
            SELECT * FROM public.users 
            WHERE email = %s;
        '''

    def get_fleet_manager(self):
        return '''
            SELECT * FROM public.fleet_managers  
            WHERE manager_id = %s;
        '''

    def get_super_admin(self):
        return '''
            SELECT * FROM public.super_admins 
            WHERE admin_id = %s;
        '''

    def get_blocked_user(self):
        return '''
            SELECT * FROM public.block_list 
            WHERE user_id = %s;
        '''

    def get_user_password(self):
        return '''
            SELECT * FROM public.password 
            WHERE user_id = %s;
        '''


query = Auth_Queries()
