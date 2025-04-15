from fastapi import FastAPI, UploadFile, File, HTTPException
from database_connection_service.db_connection import get_connection
from database_connection_service.classes_input import *
from datetime import datetime, timedelta
from medibot_RAG_service.mediBot import mediBotRag , initializeState, vector_store
from langgraph.types import Command
from langchain_community.document_loaders import PyPDFLoader
from tempfile import NamedTemporaryFile
from bot_scheduler_service.schedulerBot import schedulerBotFunction
from fastapi.middleware.cors import CORSMiddleware

# user information
config = {"configurable": {"thread_id": "1"}}

# Graph Initialization, this is just to initialize the states
h = mediBotRag.invoke(initializeState(), config = config)


app = FastAPI()

# Add CORS middleware to allow OPTIONS requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict origins in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods, including OPTIONS
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello, World!"}

# Get Endpoints: 
@app.get("/getAdmins")
def get_admins():
    '''Only By Admins'''
    '''
    Documentation: 
        - get all admins in the table of admins, only to admins 
    '''
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
    '''Only By Admins'''
    '''
    Documentation: 
        - get all doctors in the table of doctors, only to admins 
    '''
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
    '''Only By Admins'''
    '''
    Documentation: 
        - get all patients in the table of patients, only to admins 
    '''
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
    '''Only By Admins'''
    '''
    Documentation: 
        - get all appointments in the table of appointments, only to admins
    '''
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

@app.post("/getAllAppointmentsForPatient")
def getAllAppointmentsForPatient(input: getAllAppointmentsForPatientInput):
    '''
    Documentation: 
        - For a parrtciular patient show all appointments
    '''
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Appointments WHERE PatientId = %s", (input.PatientId,))
        appointments = cursor.fetchall()
        return {"appointments": appointments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/addDoctor")
def addDoctor(input: addDoctorInput): 
    '''Only By Admins'''
    '''
    Documentation: 
        - Add a parituclar doctor to the clinic db, restricted to only admins
    '''
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
    '''Only By Admins'''
    '''
    Documentation: 
        - Add a parituclar patient to the clinic db, restricted to only admins
    '''
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
    '''
    Documentation: 
        - insert an appointment between a doctor and patient at a particular date and time 
    '''
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        # Check if the doctor is available in the current timing
        cursor.execute("SELECT * FROM Appointments WHERE DoctorId = %s AND Date = %s AND startTime = %s",
                       (input.DoctorId, input.Date, input.startTime))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Doctor is not available at the selected time")
        # Check if the patient has an appointment at the same time
        cursor.execute("SELECT * FROM Appointments WHERE PatientId = %s AND Date = %s AND startTime = %s",
                       (input.PatientId, input.Date, input.startTime))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Patient already has an appointment at the selected time")
        # Insert the appointment
        query = """

            INSERT INTO Appointments (DoctorId, PatientId, Date, startTime, feedback)
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (input.DoctorId, input.PatientId, input.Date, input.startTime, input.feedback)
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Appointment added successfully"}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/showOneDoctorAllPatients")
def showOneDoctorAllPatients(input: showOneDoctorAllPatientsInput):
    '''
    Documentation: 
        - For a particular patient and doctor (and date of course), show all appointments between this doctor and this patient, and also show all (this) doctor appointments with other patietns in thsi date
    '''
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        # the one in blue 
        current_date = input.Date
        next_5_days = (datetime.strptime(current_date, "%Y-%m-%d") + timedelta(days=5)).strftime("%Y-%m-%d")
        cursor.execute("SELECT Date,startTime FROM Appointments WHERE DoctorId = %s AND PatientId = %s AND Date >= %s AND Date <= %s",
                       (input.DoctorId, input.PatientId, input.Date, next_5_days))
        appointments_in_blue = cursor.fetchall()
        cursor.execute("SELECT Date,startTime FROM Appointments WHERE DoctorId = %s AND PatientId != %s AND Date >= %s AND Date <= %s",
                       (input.DoctorId, input.PatientId, input.Date, next_5_days))
        appointments_in_red = cursor.fetchall()
        return {
            "appointments_in_blue" : appointments_in_blue, 
            "appointments_in_red": appointments_in_red
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:    
        cursor.close()
        connection.close()

@app.post("/deleteAppointment")
def deleteAppointment(input: deleteAppointmentInput):   
    '''
    Documentation: 
        - to delete an appointment between patient and doctor at a particular day and time
    '''
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        query = """
            DELETE FROM Appointments WHERE PatientId = %s AND DoctorId = %s AND Date = %s AND startTime = %s
        """
        values = (input.PatientId, input.DoctorId, input.Date, input.startTime)
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Appointment deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

# Chatbot Endpoint:
@app.post("/addPDFToVB")
async def addDocumentToVB(file: UploadFile = File(description="Upload a PDF file of the document you want to add")):
    '''restricted to admins only'''
    '''
    Documentation: 
        This endpoint is used to add a PDF document to the vector store. So now the vector is dynamic, the admin of the clinic, can add more documents to the vector store. 
        note: vector store persistent across builds!
    '''
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF file.")
    global vector_store
    try: 
        contents = await file.read()
        with NamedTemporaryFile(delete=True, suffix=".pdf") as tmp:
            tmp.write(contents)
            tmp.flush()
            tmp_path = tmp.name
            loader = PyPDFLoader(tmp_path, mode = "single") # it is either single or page, if single then the whole pdf is one document, if page then each page is a document
            docs = loader.load() 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    try: 
        vector_store.add_documents(documents=docs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Document added successfully"}

@app.post("/mediBotRagEndpoint")
def mediBotRagEndpoint(input: mediBotRagInput):
    '''
    Documentation: 
        This endpoint is used to ask the question from the user to the RAG system, if the vector store is empty, regular LLM(gpt-4o in this case) will be used. 
    '''
    global mediBotRag
    # Note for now I am not using PatientId, this is for later
    h = mediBotRag.invoke(Command(resume = input.userQuestions), config = config)
    return {"answer": h['answersAI'][-1]}

# Scheduler Bot Endpoint:
@app.post("/schedulerBotEndpoint")
def schedulerBotEndpoint(input:str, PatientID: str): 
    res = schedulerBotFunction(input, PatientID)
    return {"answer": res}