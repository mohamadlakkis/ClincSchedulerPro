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
    startTime: int = 1
    feedback: Optional[str] = ""

class showOneDoctorAllPatientsInput(BaseModel): 
    DoctorId: int   
    Date: str
    PatienId: int


class deleteAppointmentInput(BaseModel): 
    PatientId: int
    DoctorId: int
    Date: str
    startTime: int

class getAllAppointmentsForPatientInput(BaseModel):
    PatientId: int

class mediBotRagInput(BaseModel): 
    userQuestions: str
    PatientId: int