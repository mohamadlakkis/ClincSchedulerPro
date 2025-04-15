from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    user_type: str  # 'admin', 'doctor', or 'patient'
    # Additional fields based on user type
    specialty: str | None = None  # for doctors
    age: int | None = None       # for patients
    gender: str | None = None    # for patients
    info: str | None = None      # for both doctors and patients

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str

class TokenData(BaseModel):
    email: str | None = None
    user_type: str | None = None