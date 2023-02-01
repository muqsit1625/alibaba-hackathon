import os
import psycopg2
import psycopg2.extras
from log import logger
from pymongo import MongoClient

class Database:

    def __init__(self):
        self.conn = None
        self.cursor = None
        self.mongo = None
        self.m_db = None

    async def connectDB(self):
        self.connect_postgres()
        self.connect_mongodb()

    async def disconnectDB(self):

        if self.conn is not None:
            self.conn.close()

        if self.cursor is not None:
            self.cursor.close()

        if self.mongo is not None:
            self.mongo.close()
        logger.info("Database disconnected Successfully")

    def connect_postgres(self):
        try:
            self.conn = psycopg2.connect(
                host=os.getenv('HOST_URI'),
                port=os.getenv("PG_PORT"),
                database=os.getenv("PG_DB"),
                user=os.getenv("PG_USER"),
                password=os.getenv("PG_PWD"))

            self.cursor = self.conn.cursor(
                cursor_factory=psycopg2.extras.RealDictCursor)

            logger.info("Database Connected Successfully")
        except (Exception, psycopg2.DatabaseError) as error:
            logger.error("PG_Database Connection error", error)

    def connect_mongodb(self):
        try:
            self.mongo = MongoClient(f'''mongodb+srv://{os.getenv('MONGO_USER')}:{os.getenv('MONGO_PWD')}@{os.getenv('MONGO_HOST_URI')}/?retryWrites=true&w=majority&authSource={os.getenv('MONGO_DB')}''')

            self.m_db = self.mongo['autilent']
            
            logger.info("Mongodb connected successfully...")
        except (Exception) as error:
            logger.error("Unable to connect to the MongoDB server.", error)


db = Database()
