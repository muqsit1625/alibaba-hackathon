import os
import uuid
from log import logger
from fastapi import HTTPException


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

