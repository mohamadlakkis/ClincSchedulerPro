from pydantic import BaseModel
from typing import Optional

class addDoctorInput(BaseModel):
    DoctorId: int
    DoctorName: str
    DoctorInfo: str
    DoctorSpecialty: str
    Email: str
    Password: str

class addPatientInput(BaseModel):
    PatientId: int
    PatientName: str
    PatientInfo: str
    PatientAge: int
    Gender: str = "M"
    Email: str
    Password: str

class addAppointmentInput(BaseModel):
    DoctorId: int
    PatientId: int 
    Date: str = "2023-10-01"
    startTime: str = "10:00"
    endTime: str = "11:00"
    feedback: Optional[str] = ""