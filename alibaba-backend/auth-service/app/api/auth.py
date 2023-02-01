from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Request, Depends, Header

from models import AdminIn, LoginForm
from db_manager import auth_for_users as afu
from utils import get_current_user

auth = APIRouter()


@auth.get("/",status_code=201)
async def index():
    return {'status' : 'Success from / of AUTH'}



@auth.post("/signup-admin",status_code=201)
async def signupAdmin(request : Request, user : AdminIn):
    response = await afu.add_new_user(request.client.host, user)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')


@auth.post("/login",status_code=201)
async def signupAdmin(request : Request, form_data : LoginForm, user_agent : Union[str, None] = Header(default=None)):
    response = await afu.login_user(request.client.host, user_agent, form_data)
    if response['status'] == 200:
        return {**response}
    else:
        raise HTTPException(status_code=404, detail='An error occurred while executing transaction')



@auth.get("/current_user",status_code=201)
async def get_current_user(request : Request, current_user = Depends(get_current_user)):
    user_in_db = await afu.get_existed_user(current_user['email'])
    
    if user_in_db:
        return {'status' : 200, 'user' : user_in_db, 'role' : current_user['role']}

    raise HTTPException(status_code=404, detail='Unauthorized!')