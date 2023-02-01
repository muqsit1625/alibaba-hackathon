import base64
import io

import cv2
from imageio import imread
import requests

url = """https://new-autilent.s3.amazonaws.com/drivers/1ed3e42d-542b-6090-9a1c-0242c0a8a006.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4LIKQYIECLOSUVKR%2F20220927%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20220927T093434Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=c390f84c66224c740281029cbef671cbf03b7337fe683d6a137c461a91c6de8c"""

response = requests.request("GET", url)
print(dir(response), type(response), response.text)
# img_base64 = (response.content)
# b64_string = img_base64.decode()

# reconstruct image as an numpy array
img = imread(io.BytesIO(response.content))
print(img.shape)
cv2.imwrite('/Users/muhammadibrahimchippa/PycharmProjects/Autilent-MSBackend-v1/drivers_service/test.jpeg', img)