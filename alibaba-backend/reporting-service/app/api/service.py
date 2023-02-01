import os
import requests
from fastapi import HTTPException


LOCAL_HOST_AUTH = os.getenv("LOCAL_HOST_AUTH")


async def check_user_logged_in(authorization):

    headers = {"Authorization": authorization}
    try:
        response = requests.get(
            url=f"{LOCAL_HOST_AUTH}/auth/api/v1/current_user", headers=headers, verify=False)

        if response.ok:
            return response.json()

        response = response.json()
        raise Exception(response['detail'])

    except (Exception) as error:
        return {'status': 400, 'detail': str(error)}
