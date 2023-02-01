import pika
import os


class CloudChannelConnection():

    def __init__(self):
        self.url = os.getenv('CLOUDAMQP_URL')
        self.cloud_amqp_params = None
        self.CloudConnection = None
        self.CloudChannel = None
        self.credentials = pika.PlainCredentials('MjphbXFwLXNnLTZ3cjMyajM0YzA3MzpMVEFJNXQ5a25zNzdwdUpvWHpFVVBjdVo=',
                                            'QkU4MzdDRkY2NTJDQ0FBMzdFNEQwRTBBMEI4RTBCQUQ2OERERTE3NToxNjc1MTcyMzcyMzkw')
        # parameters = pika.ConnectionParameters(credentials=credentials, heartbeat=0)
        self.params = pika.ConnectionParameters(host='amqp-sg-6wr32j34c073.me-central-1.amqp-0.vpc.mq.amqp.aliyuncs.com',
                                                credentials=self.credentials, heartbeat=0)
        # self.connection = pika.BlockingConnection(self.params) 
        self.connect()

    def connect(self):

        self.cloud_amqp_params = pika.ConnectionParameters(heartbeat=0)
        self.CloudConnection = pika.BlockingConnection(
            self.params)
        self.CloudChannel = self.CloudConnection.channel()
        self.CloudChannel.confirm_delivery()

    def reconnect(self, routing_key, msg, properties):

        self.cloud_amqp_params = pika.ConnectionParameters(heartbeat=0)
        self.CloudConnection = pika.BlockingConnection(
            self.params)
        self.CloudChannel = self.CloudConnection.channel()
        self.CloudChannel.queue_declare(queue=routing_key)
        self.CloudChannel.basic_publish(
            exchange='', routing_key=routing_key, body=msg, properties=properties)

    def disconnect(self):
        self.CloudConnection.close()


cloud_channel_conn = CloudChannelConnection()
CloudChannel = cloud_channel_conn.CloudChannel
