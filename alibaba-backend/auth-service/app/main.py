import sys
import os

sys.path.append(os.getcwd()+'/app/api')


from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from auth import auth
from log import logger
from db import db

import traceback


app = FastAPI(openapi_url="/api/v1/auth/openapi.json",docs_url="/api/v1/auth/docs")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.connectDB()



@app.middleware("http")
async def error_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as error:
        traceback.print_exc()
        return JSONResponse(status_code = 404, content={'message' : str(error), 'status' : 404})
       


@app.on_event("shutdown")
async def shutdown():
    await db.disconnectDB()


app.include_router(auth, prefix='/auth/api/v1', tags=['auth'])
