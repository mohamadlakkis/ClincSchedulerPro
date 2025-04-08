from fastapi import FastAPI, HTTPException
from db_connection import get_connection
from classes_input import *
app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello, World!"}


'''Admin Session'''

# Get Endpoints: 
@app.get("/getAdmins")
def get_admins():
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True) # used dict = True to return the results as dict
        cursor.execute("SELECT * FROM Admin")
        admins = cursor.fetchall()
        return {"admins": admins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get("/getDoctors")
def get_doctors():
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Doctors")
        doctors = cursor.fetchall()
        return {"doctors": doctors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get("/getPatients")
def get_patients():
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Patients")
        patients = cursor.fetchall()
        return {"patients": patients}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get("/getAppointments")
def get_appointments():
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Appointments")
        appointments = cursor.fetchall()
        return {"appointments": appointments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()
# Post Endpoints:
@app.post("/addDoctor")
def addDoctor(input: addDoctorInput): 
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO Doctors (DoctorId, DoctorName, DoctorInfo, DoctorSpecialty, Email, Password)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (input.DoctorId, input.DoctorName, input.DoctorInfo, input.DoctorSpecialty, input.Email, input.Password)
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Doctor added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/addPatient")
def addPatient(input: addPatientInput): 
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO Patients (PatientId, PatientName, PatientInfo, PatientAge, Gender, Email, Password)
            VALUES ( %s, %s, %s, %s, %s, %s, %s)
        """
        values = (input.PatientId, input.PatientName, input.PatientInfo, input.PatientAge, input.Gender, input.Email, input.Password)
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Patient added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/insertAppointment")
def insertAppointment(input: addAppointmentInput):
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        query = """

            INSERT INTO Appointments (DoctorId, PatientId, Date, startTime, endTime, feedback)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (input.DoctorId, input.PatientId, input.Date, input.startTime, input.endTime, input.feedback)
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Appointment added successfully"}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/showBusyDoctorsAllPatients")
def showBusyDoctorsAllPatients(input): 
    # restricted to admins only
    return {"message": "showBusyDoctorsAllPatients"}