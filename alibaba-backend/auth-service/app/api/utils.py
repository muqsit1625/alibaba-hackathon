import os
import uuid
from datetime import datetime
from jose import JWTError, jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer



SECRET_KEY = os.getenv('SECRET_KEY') or "29a5b794fbf98135c40ae842452eecec9d1207780ddc68caab0031482663dba1"
ALGORITHM ="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")) or 1440

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


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




async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException( status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if int(payload.get("exp")) < int(datetime.utcnow().timestamp()):
            raise HTTPException(status_code= 400, detail= "Token expired")
        return payload

    except JWTError:
        raise HTTPException(status_code= 400, detail= "Could not validate credentials")
    
    return payload
