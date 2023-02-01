from models import AdminIn, LoginForm
from utils import uuidv6, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from passlib.context import CryptContext
from fastapi import HTTPException, Request, Depends, status
from typing import Union, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from queries import query
from log import logger
from db import db
import psycopg2
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthForUsers():

    async def get_new_admin_obj(self, admin_id, password_id, user):
        user_exist = await self.get_existed_user(user.email)
        if user_exist:
            self.return_exception("User already exists")

        user.password = await self.get_password_hash(user.password)
        return self.get_map_from_object({'admin_id': admin_id, 'password_id': password_id}, user)

    async def add_new_user(self, client_ip: str, user: AdminIn):
        admin_id = uuidv6()
        password_id = uuidv6()

        new_admin = await self.get_new_admin_obj(admin_id, password_id, user)

        try:
            db.cursor.execute(query.add_super_admin(), new_admin)
            db.conn.commit()
            self.result_to_mongo(client_ip, None, admin_id, 'SUCCESS')
            return self.return_response(db.cursor)

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            db.conn.rollback()
            await db.connectDB()
            self.result_to_mongo(client_ip, error, admin_id, 'FAIL')
        except (Exception, psycopg2.Error) as error:
            self.result_to_mongo(client_ip, error, admin_id, 'FAIL')
        return {'status': 400}

    async def get_existed_user(self, email: str):
        try:
            db.cursor.execute(query.get_user(), (email,))
            return db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
            return {'status': 400}

    async def get_existed_fleet_manager(self, user_id: str):
        try:
            db.cursor.execute(query.get_fleet_manager(), (user_id,))
            return db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            print(f"error : {error}")
            return self.return_exception(error)
            # return {'status': 400}

    async def is_user_admin_or_manager(self, user_id: str):

        try:
            db.cursor.execute(query.get_super_admin(), (user_id,))
            return "super_admin" if db.cursor.fetchone() else "fleet_manager"

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return {'status': 400}

    async def is_user_blocked(self, user_id: str):
        try:
            db.cursor.execute(query.get_blocked_user(), (user_id,))
            return db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return {'status': 400}

    async def get_user_password(self, user_id: str):

        try:
            db.cursor.execute(query.get_user_password(), (user_id,))
            return db.cursor.fetchone()

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return {'status': 400}

    async def create_access_token(self, data: dict, expires_delta: Union[timedelta, None] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def login_user(self, client_ip, browser_type, data: LoginForm):
        user = await self.get_existed_user(data.email)

        status, user_hashed_password = await self.authenticate_user(data, user, browser_type, client_ip)
        user_role = await self.is_user_admin_or_manager(user['user_id'])

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = await self.create_access_token(
            {'email': user['email'], 'user_id': user['user_id'], 'role': user_role}, access_token_expires)

        print(f"user_role: {user_role}")
        if user_role == "fleet_manager":
            print(f"user['user_id'], {type(user['user_id'])}")
            fleet_user = await self.get_existed_fleet_manager(user['user_id'])
            print(f"fleet_user: {fleet_user}")
            user.update(fleet_user)

        await self.create_login_attempt(client_ip, browser_type, True, user_hashed_password, user['user_id'])
        return {'status': 200, 'token': access_token, 'token_type': 'Bearer', 'user': user}

    async def create_login_attempt(self, client_ip, browser_type, status, password, user_id):
        try:
            db.cursor.execute(query.add_login_attempt(
            ), (uuidv6(), browser_type, status, password, user_id))
            db.conn.commit()
            self.result_to_mongo(client_ip, None, user_id, 'SUCCESS')

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as error:
            await db.connectDB()
            self.return_exception(error)
        except (Exception, psycopg2.Error) as error:
            self.return_exception(error)
        return {'status': 400}

    async def authenticate_user(self, data, user, browser_type, client_ip):
        message = None
        user_pwd = None
        user_id = None

        user_password = await self.get_user_password(user['user_id']) if user else None

        if not user:  # checking if user not exist in db
            message = "User doesn't exist"
        elif not await self.verify_password(data.password,
                                            user_password['password']):  # verifying user entered pwd with database pwd
            message, user_pwd, user_id = [
                "Invalid Credentials", user_password['password'], user['user_id']]
        # verify if user is blocked
        elif await self.is_user_blocked(user['user_id']):
            message, user_pwd, user_id = [
                "User is blocked", user_password['password'], user['user_id']]
        else:
            return (True, user_password['password'])

        await self.create_login_attempt(client_ip, browser_type, False, user_pwd, user_id)
        self.return_exception(message)

    async def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    async def get_password_hash(self, password):
        return pwd_context.hash(password)

    def get_map_from_object(self, map, user):
        map.update(user)
        return map

    def return_response(self, cursor):
        res = {'status': 200, 'result': cursor.rowcount}
        return res

    def result_to_mongo(self, client_ip, error, user_id, status):
        self.log_to_mongo(client_ip, user_id, db.cursor.query, status)
        if status == 'FAIL':
            self.return_exception(error)

    def return_exception(self, error, status_code=400):
        logger.error("Exception : {0}".format(str(error)))
        raise HTTPException(status_code=status_code, detail=error)

    def log_to_mongo(self, client_ip, user_id, query, status):
        table = db.m_db['logs']
        query = self.get_query(query)
        log = self.mongo_log_object(client_ip, user_id, query, status)
        table.insert_one(log)

    def mongo_log_object(self, client_ip, user_id, query, status):
        return {
            'user_id': user_id,
            'database': os.getenv('PG_DB'),
            'statement': query,
            'status': status,
            'created_at': datetime.now(),
            'client_ip': client_ip,
        }

    def get_query(self, query):
        string = self.convert_binary_to_string(query)
        return self.remove_long_whitespaces(string)

    def convert_binary_to_string(self, query):
        return query.decode('utf-8')

    def remove_long_whitespaces(self, string):
        return " ".join(string.split())


auth_for_users = AuthForUsers()
