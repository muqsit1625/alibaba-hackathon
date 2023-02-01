from functools import wraps
from typing import Any, Callable, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from service import check_user_logged_in


async def get_authorization_token(request):
   if request and request.headers:
         try:
            authorization = request.headers['authorization']
         
            if authorization == '':
               return {"status" : 400, 'detail' : "Invalid Token"}
            return {'status' : 200, 'token' : authorization}
         
         except (Exception) as err:
            return {"status" : 400, 'detail' : "Token does not exist"}

   else:
      return {"status" : 400, 'detail' : "Headers does not exist"}


def auth_required(roleName):
   def auth_required_decorator(func: Callable) -> Callable:
      @wraps(func)
      async def wrapper(*args: Any, **kwargs: Any):
         
         request = kwargs["request"]

         try:
            authorization = await get_authorization_token(request)
            
            if authorization['status'] == 200:
               response = await check_user_logged_in(authorization['token'])

               if response['status'] != 400:

                  if response['role'] in roleName:
                     kwargs['user'] = response['user']
                     return await func(*args, **kwargs)
                  else:
                     raise Exception("User is not allowed")   

               else:
                  raise Exception(response['detail'])
            else:
               raise Exception(authorization['detail'])

         except (Exception) as err:
            return JSONResponse(status_code = 404, content={'message' : str(err), 'status' : 404})
      
      return wrapper
   return auth_required_decorator