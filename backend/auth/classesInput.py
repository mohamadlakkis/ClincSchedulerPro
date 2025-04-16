from pydantic import BaseModel


class SignUpPatient(BaseModel): 
    PatientId: str
    PatientName: str
    PatientInfo: str | None
    PatientAge: int
    Gender: str | None  # M or F
    Email: str
    Password: str

class SignUpDoctor(BaseModel):
    DoctorId: str
    DoctorName: str
    DoctorInfo: str | None
    DoctorSpecialty: str
    Email: str
    Password: str

class loginInput(BaseModel): 
    email: str
    password: str