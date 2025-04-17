from pydantic import BaseModel


class SignUpPatient(BaseModel): 
    PatientName: str
    PatientInfo: str | None
    PatientAge: int
    Gender: str | None  # M or F
    Email: str
    Password: str

class SignUpDoctor(BaseModel):
    DoctorName: str
    DoctorInfo: str | None
    DoctorSpecialty: str
    Email: str
    Password: str

class loginInput(BaseModel): 
    email: str
    password: str