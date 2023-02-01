import requests
import cv2

img = cv2.imread('./Screenshot 2022-09-27 at 10.22.34 PM.png')
url = "http://192.168.100.17:8080/api/v1/vehicles/current_driver/1ed3f29a-c6af-6352-8f22-0242ac140006"
header = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hbmFsQGdtYWlsLmNvbSIsInVzZXJfaWQiOiIxZWQyMWVkNy0xNzk2LTY5OWUtOTAyZC0wMjQyYzBhOGEwMDIiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJleHAiOjE2NjU2NDc0ODR9.9UR_E-JEQASl6oSaFSn4Y2rakcGXXhVNewVHvvJrp20"}

retval, imencoded = cv2.imencode('.jpg', img)

# Convert to base64 encoding and show start of data
# jpg_as_text = base64.b64encode(buffer)

file = {'file': ('image.jpg', imencoded.tobytes(), 'image/jpeg', {'Expires': '0'})}
response = requests.post(url, files=file, headers=header)
print(response.status_code, response.text)
