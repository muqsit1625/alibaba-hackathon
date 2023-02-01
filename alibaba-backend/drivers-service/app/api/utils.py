import io
import os
import traceback
import uuid
import boto3
import requests
from imageio.v2 import imread

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
                      config=Config(signature_version='s3v4', retries={'max_attempts': 3, 'mode': 'standard'}))
    s3.put_bucket_cors(Bucket=os.getenv('AWS_BUCKET_NAME'), CORSConfiguration=cors_configuration)
    return s3


def generate_image_key(image_name):
    return os.getenv("AWS_IMAGE_KEY") + str(image_name) + '.jpeg'


def generate_s3_url(imageName):
    s3_client = get_boto3_client()

    response = None
    try:
        response = s3_client.generate_presigned_post(Bucket=os.getenv('AWS_BUCKET_NAME'),
                                                     Key=os.getenv("AWS_IMAGE_KEY") + str(imageName) + '.jpeg',
                                                     ExpiresIn=1800)
    except ClientError as err:
        logger.error("Boto3 : ", err)
        raise HTTPException(status_code=404, detail=err)

    return {'result': response, 'status': 200}


def generate_s3_url_from_image(image_key):
    s3_client = get_boto3_client()

    response = None
    try:
        response = s3_client.generate_presigned_post(Bucket=os.getenv('AWS_BUCKET_NAME'),
                                                     Key=image_key,
                                                     ExpiresIn=1800)
    except ClientError as err:
        logger.error("Boto3 : ", err)
        raise HTTPException(status_code=404, detail=err)

    return {'result': response, 'status': 200}


def generate_s3_url_for_object(key_to_use):
    s3_client = get_boto3_client()

    response = None
    try:
        response = s3_client.generate_presigned_post(Bucket=os.getenv('AWS_BUCKET_NAME'),
                                                     Key=key_to_use,
                                                     ExpiresIn=1800)
    except ClientError as err:
        logger.error("Boto3 : ", err)
        raise HTTPException(status_code=404, detail=err)

    return {'result': response, 'status': 200}


def get_presigned_url(s3_client, key):
    response = s3_client.generate_presigned_url('get_object',
                                                Params={'Bucket': os.getenv('AWS_BUCKET_NAME'), 'Key': key},
                                                ExpiresIn=21600)  # 21600 = 6 hours
    return response


def get_object_url(object_key):
    s3_client = get_boto3_client()
    response = None
    try:
        response = get_presigned_url(s3_client, object_key)
    except ClientError as err:
        logger.error("Boto3 : ", err)
        raise HTTPException(status_code=404, detail=err)

    return {'result': response, 'status': 200}


def get_image_url(image_key):
    s3_client = get_boto3_client()
    response = None
    try:
        response = get_presigned_url(s3_client, image_key)
    except ClientError as err:
        logger.error("Boto3 : ", err)
        raise HTTPException(status_code=404, detail=err)

    return {'result': response, 'status': 200}


def get_image_array_from_url_via_request(image_url: str):
    try:
        response = requests.request("GET", image_url)
        img = imread(io.BytesIO(response.content))
        print("IMG: ", img)
        return img
    except Exception as e:
        traceback.print_exc()
        print(f"error: {e}")


def generate_image_and_object_key_from_media_url(media_url: str):
    media_url = media_url.split('/')[-1]
    image_key = 'drivers/' + media_url
    object_key = 'drivers/' + media_url.split('.')[0] + '.json'
    return image_key, object_key
