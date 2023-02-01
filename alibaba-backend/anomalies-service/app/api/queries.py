
class Anomalies_Queries:
    
    def get_all_drivers_of_manager(self):
        return '''
                SELECT * FROM drivers WHERE drivers.manager_id = %(user_id)s
        '''


    def get_all_vehicles_of_manager(self):
        return '''
                SELECT * FROM vehicles WHERE vehicles.manager_id = %(user_id)s
        '''
        

query = Anomalies_Queries()