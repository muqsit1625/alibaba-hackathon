import os
import uuid
import boto3
from log import logger
from fastapi import HTTPException
from botocore.client import Config
from botocore.exceptions import ClientError

cors_configuration = {
    'CORSRules': [{
        'AllowedHeaders': ['Authorization'],
        'AllowedMethods': ['GET', 'PUT'],
        'AllowedOrigins': ['*'],
        'ExposeHeaders': ['ETag', 'x-amz-request-id'],
        'MaxAgeSeconds': 3000
    }]
}


def generate_uuidv6():
    u = uuid.uuid1()
    uh = u.hex
    tlo1 = uh[:5]
    tlo2 = uh[5:8]
    tmid = uh[8:12]
    thig = uh[13:16]
    rest = uh[16:]
    uh6 = thig + tmid + tlo1 + '6' + tlo2 + rest
    
    return str(uuid.UUID(hex=uh6))

def uuidv6():
    return generate_uuidv6()


def get_boto3_client():
    s3 = boto3.client("s3", aws_access_key_id=os.getenv('AWS_ACCESS_KEY'), 
                aws_secret_access_key=os.getenv('AWS_SECRET_KEY'), 
                region_name=os.getenv("AWS_REGION"), 
                config=Config(signature_version='s3v4', retries = {'max_attempts': 3,'mode': 'standard'}))
    s3.put_bucket_cors(Bucket=os.getenv('AWS_BUCKET_NAME'), CORSConfiguration=cors_configuration)
    return s3


def generate_s3_url(imageName):
    
    s3_client = get_boto3_client()

    response = None
    try:
        response = s3_client.generate_presigned_post(Bucket=os.getenv('AWS_BUCKET_NAME'),Key=os.getenv("AWS_IMAGE_KEY") + str(imageName) +'.jpeg',ExpiresIn=1800)
    except ClientError as err:
        logger.error("Boto3 : ", err)
        raise HTTPException(status_code=404, detail=err)

    return {'result' : response, 'status' : 200}


def get_image_url(image_key):
    
    s3_client = get_boto3_client()

    response = None
    try:
        response = s3_client.generate_presigned_url('get_object', Params={'Bucket': os.getenv('AWS_BUCKET_NAME'), 'Key': image_key}, ExpiresIn=21600)  # 21600 = 6 hours
    except ClientError as err:
        logger.error("Boto3 : ", err)
        raise HTTPException(status_code=404, detail=err)

    return {'result' : response, 'status' : 200}




def delete_image_url(image_key):
    s3_client = get_boto3_client()
    try:
        response = s3_client.delete_object(Bucket = os.getenv('AWS_BUCKET_NAME'), Key = image_key)
    except ClientError as err:
        logger.error("Boto3 : ", err)
        raise HTTPException(status_code=404, detail=err)

    return {'result' : response, 'status' : 200}
