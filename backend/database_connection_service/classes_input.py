from pydantic import BaseModel
from typing import Optional

class addDoctorInput(BaseModel):
    DoctorName: str
    DoctorInfo: str
    DoctorSpecialty: str
    Email: str
    Password: str

class addPatientInput(BaseModel):
    PatientName: str
    PatientInfo: str
    PatientAge: int
    Gender: str = "M"
    Email: str
    Password: str

class insertAvailabilityofDoctorInput(BaseModel):
    DoctorId: int
    Date: str = "2023-10-01"
    startTime: int = 1

class showOneDoctorAllPatientsInput(BaseModel): 
    DoctorId: int   
    Date: str
    PatientId: int

class deleteAppointmentInput(BaseModel): 
    PatientId: int
    DoctorId: int
    Date: str = "2023-10-01"
    startTime: int

class getAllAppointmentsForPatientInput(BaseModel):
    PatientId: int

class mediBotRagInput(BaseModel): 
    userQuestions: str
    PatientId: int

class DeleteAvailabilityOfDoctorInput(BaseModel):
    DoctorId: int
    Date: str = "2025-04-21"
    startTime: int


class bookAppointmentInput(BaseModel):
    PatientId: int
    DoctorId: int
    Date: str = "2025-04-21"
    startTime: int

class checkAppointmentInput(BaseModel):
    PatientId: int
    Date: str = "2025-04-21"