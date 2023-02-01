import requests, json

url = 'https://new-autilent.s3.amazonaws.com/drivers/1ed3e42d-542b-6090-9a1c-0242c0a8a006.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4LIKQYIECLOSUVKR%2F20220928%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20220928T073841Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=35dac993394653171f77b3958483f9e7e7decec20fc8895abc4d0b668a691598'
response = requests.request('GET', url)
print(response.status_code, json.loads(response.content))