from models import ManagersIn, ManagersUpdate
from utils import uuidv6, generate_s3_url, get_image_url, delete_image_url
from passlib.context import CryptContext
from fastapi import HTTPException
from datetime import datetime
from queries import query
from log import logger
from db import db
import psycopg2
import os


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#------------------ Super Admin Functions--------------------#
class SuperAdminForManager():

    async def get_count_data(self):
        all_counts = None
        
        try:
            db.cursor.execute(query.get_count_data_query())
            all_counts = db.cursor.fetchone()
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return all_counts

    
    async def get_all_managers(self,  client_ip : str):
        all_managers = []
        
        try:
            db.cursor.execute(query.get_query())
            all_managers = db.cursor.fetchall()
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)

        return all_managers
  


    async def get_single_manager(self, client_ip : str, manager_id : str):
        single_manager = {}

        try:
            db.cursor.execute(query.get_single_query(), (manager_id,))
            single_manager = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return single_manager


    
    def get_map_from_object(self, map, manager):
        map.update(manager)
        return map



    async def add_new_manager(self, client_ip : str, manager : ManagersIn, admin):
        
        manager_id = uuidv6()
        user_exist = await self.is_manager_exist(manager.email)

        if user_exist:
            raise Exception("User already exist")             
        
        hashPassword = self.get_password_hash(manager.password)

        # print(manager_id," : " ,generated_pwd)
        
        new_manager = self.get_map_from_object({ 'manager_id' : manager_id, 'password_id' : uuidv6(), 'hashPassword' : hashPassword, 'created_by' : admin['user_id'] }, manager)
        
        
        try:
            db.cursor.execute(query.add_new_query(), new_manager)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, admin['user_id'], 'SUCCESS')
            return {'status': 200, 'result' : db.cursor.rowcount, 'password' : hashPassword}

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, admin['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, admin['user_id'], 'FAIL')
        return {'status' : 400}



    async def is_manager_exist(self, email : str):    
        try:
            db.cursor.execute(query.get_user(), (email, ))
            result = db.cursor.fetchone()
            if result:
                return True

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return False


    async def get_s3image_url(self, image_key : str):

        response = get_image_url(image_key)
        return {'status' : 200, 'result' : response}

    

    async def add_image_to_s3url(self, image_key : str):
        response = generate_s3_url(image_key)
        return {**response}



    async def delete_image_from_s3(self, image_key : str):
        response = delete_image_url(image_key)
        return {'status' : 200, 'result' : response}



    async def delete_single_manager(self, client_ip : str, manager_id : str, user):
        record_id1 = uuidv6()          # to insert the  deleted user row
        record_id2 = uuidv6()           # to insert the deleted manager row
        record_id3 = uuidv6()           # to isnert the deleted password row
        admin_id = user['user_id']

        try:
            db.cursor.execute(query.delete_single_query(), (manager_id, record_id1, admin_id, 
            manager_id, record_id2, admin_id, manager_id, record_id3, admin_id,))
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status' : 200}


    def return_response(self, cursor, image_url = None):
        res = {'status': 200, 'result' : cursor.rowcount}
        if image_url:
            res['upload_image'] = image_url['result']
        return res



    async def update_single_manager(self, client_ip : str, manager : ManagersUpdate, user):
        updated_manager = self.get_map_from_object({}, manager)
        
        try:
            db.cursor.execute(query.update_single_query(), updated_manager)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor)      
            
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status' : 400}
    

    async def update_warehouse_location(self, client_ip : str, longitude, latitude, user):
        
        try:
            db.cursor.execute(query.update_warehouse_location(), {
                'latitude':latitude, 'longitude':longitude, 'manager_id':user['user_id']
            })
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user['user_id'], 'SUCCESS')
            return self.return_response(db.cursor)      
            
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, user['user_id'], 'FAIL')
        return {'status' : 400}
    
    async def get_warehouse_location(self, client_ip : str, manager_id : str):
        warehouse_location = {}

        try:
            db.cursor.execute(query.get_warehouse_location(), {"manager_id":manager_id})
            warehouse_location = db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return warehouse_location



    def result_to_mongo(self, client_ip, error, user_id, status):
        self.log_to_mongo(client_ip, user_id, db.cursor.query, status)
        if status == 'FAIL':
            self.return_exception(error)

    def return_exception(self, error, status_code = 400):
        logger.error("Exception : {0}".format(str(error)))
        raise HTTPException(status_code=status_code, detail=error)

    
    
    def log_to_mongo(self, client_ip, user_id, query, status):
        table = db.m_db['logs']
        query = self.get_query(query)
        log = self.mongo_log_object(client_ip, user_id, query, status)
        table.insert_one(log)



    def mongo_log_object(self, client_ip, user_id, query, status):
        return {
            'user_id' : user_id,
            'database' : os.getenv('PG_DB'),
            'statement' : query,
            'status' : status,
            'created_at' : datetime.now(),
            'client_ip' : client_ip,
        }



    def get_query(self, query):
        string = self.convert_binary_to_string(query)
        return self.remove_long_whitespaces(string)



    def convert_binary_to_string(self, query):
        return query.decode('utf-8')



    def remove_long_whitespaces(self, string):
        return " ".join(string.split())

    def verify_password(self,plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)


    def get_password_hash(self,password):
        return pwd_context.hash(password)




admin_for_managers = SuperAdminForManager()