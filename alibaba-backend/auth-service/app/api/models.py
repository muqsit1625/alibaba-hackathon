from pydantic import BaseModel


class AdminIn(BaseModel):
    first_name : str
    last_name : str
    email : str
    phone_number : str
    password : str


class LoginForm(BaseModel):
    email : str
    password : str

