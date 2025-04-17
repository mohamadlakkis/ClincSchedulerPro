from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database_connection_service.db_connection import get_connection
from database_connection_service.classes_input import *
from datetime import datetime, timedelta
from medibot_RAG_service.mediBot import mediBotRag , initializeState, vector_store
from langgraph.types import Command
from langchain_community.document_loaders import PyPDFLoader
from tempfile import NamedTemporaryFile
from bot_scheduler_service.schedulerBot import schedulerBotFunction
from auth.classesInput import loginInput, SignUpPatient, SignUpDoctor
from auth.extensions import check_password_hash, generate_password_hash
import os
import jwt

# user information
config = {"configurable": {"thread_id": "1"}}
SECRET_KEY = os.getenv('SECRET_KEY')

# Graph Initialization, this is just to initialize the states
h = mediBotRag.invoke(initializeState(), config = config)


app = FastAPI()

### Security ###
security = HTTPBearer()
def decode_token(token):
    payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    return payload['sub']
def create_token(user_id):
    payload = {
        'exp': datetime.datetime.now() + datetime.timedelta(days=4),
        'iat': datetime.datetime.now(),
        'sub': str(user_id)
    }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm='HS256'
    )
def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    '''Wrote this here as a function to simplify the code, and avoid repetition of the try/except block'''
    '''This function will be used as a dependency in the endpoints that require authentication'''
    '''If the token is valid, get_current_user decodes it and returns the user_id'''
    try:
        # token.credentials contains the token string from the header.
        user_id = decode_token(token.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid token"
        )
    return user_id

# Login and Register Endpoints:

@app.post("/loginAdmin")
def loginAdmin(auth_request: loginInput):
    """
    Authenticate a user and return a JWT token (lasts 4 days).
    This endpoint is used to log in a user. It takes an email and password 
    For now I am assuming all users are the same, so no difference between admins, doctors, and patients, I will modify it later!
    For now I am only accepting users as patients 
    """
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        tables = ["Admin"] # ["Admins", "Doctors", "Patients"]
        user = None
        user_type = None
        for table in tables:
            print(f"Checking table: {table}")
            cursor.execute(
                f"SELECT * FROM {table} WHERE Email = %s", (auth_request.email,))
            user = cursor.fetchone()
            print(f"User found: {user}")
            if user:
                user_type = table
                break
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="User not found"
            )
        if user['password'] != auth_request.password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Incorrect password"
            )
        # # Check if the provided password matches the hashed password in the database
        # if not check_password_hash(generate_password_hash(user['Password']), auth_request.password):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Incorrect password"
        #     )
        # token = create_token(user['UserId']) # create for this user_id a token, that lasts 4 days!
        token = "still testing"
        return {"token": token, "user_type": user_type, "adminEmail": user['email']}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/loginDoctor")
def loginDoctor(auth_request: loginInput):
    """
    Authenticate a user and return a JWT token (lasts 4 days).
    This endpoint is used to log in a user. It takes an email and password 
    For now I am assuming all users are the same, so no difference between admins, doctors, and patients, I will modify it later!
    For now I am only accepting users as patients 
    """
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        tables = ["Doctors"] # ["Admins", "Doctors", "Patients"]
        user = None
        user_type = None
        for table in tables:
            print(f"Checking table: {table}")
            cursor.execute(
                f"SELECT * FROM {table} WHERE Email = %s", (auth_request.email,))
            user = cursor.fetchone()
            print(f"User found: {user}")
            if user:
                user_type = table
                break
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="User not found"
            )
        if user['Password'] != auth_request.password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Incorrect password"
            )
        # # Check if the provided password matches the hashed password in the database
        # if not check_password_hash(generate_password_hash(user['Password']), auth_request.password):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Incorrect password"
        #     )
        # token = create_token(user['UserId']) # create for this user_id a token, that lasts 4 days!
        token = "still testing"
        return {"token": token, "user_type": user_type, "DoctorId": user['DoctorId']}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/loginPatient")
def loginPatient(auth_request: loginInput):
    """
    Authenticate a user and return a JWT token (lasts 4 days).
    This endpoint is used to log in a user. It takes an email and password 
    For now I am assuming all users are the same, so no difference between admins, doctors, and patients, I will modify it later!
    For now I am only accepting users as patients 
    """
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        tables = ["Patients"] # ["Admins", "Doctors", "Patients"]
        user = None
        user_type = None
        for table in tables:
            print(f"Checking table: {table}")
            cursor.execute(
                f"SELECT * FROM {table} WHERE Email = %s", (auth_request.email,))
            user = cursor.fetchone()
            print(f"User found: {user}")
            if user:
                user_type = table
                break
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="User not found"
            )
        if user['Password'] != auth_request.password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Incorrect password"
            )
        # # Check if the provided password matches the hashed password in the database
        # if not check_password_hash(generate_password_hash(user['Password']), auth_request.password):
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Incorrect password"
        #     )
        # token = create_token(user['UserId']) # create for this user_id a token, that lasts 4 days!
        token = "still testing"
        return {"token": token, "user_type": user_type, "PatientId": user['PatientId']}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/registerPatient")
def registerPatient(auth_register: SignUpPatient):
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        # Check if the email already exists in the Patients table
        print("hello")
        cursor.execute("SELECT * FROM Patients WHERE Email = %s", (auth_register.Email,))
        print("hello2")
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        # Insert the new user into the Patients table
        query = """
            INSERT INTO Patients (PatientName, PatientInfo, PatientAge, Gender, Email, Password)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        # values = (auth_register.PatientId,auth_register.PatientName, auth_register.PatientInfo, auth_register.PatientAge, auth_register.Gender, auth_register.Email, generate_password_hash(auth_register.Password))
        values = (auth_register.PatientName, auth_register.PatientInfo, auth_register.PatientAge, auth_register.Gender, auth_register.Email, auth_register.Password) 
        cursor.execute(query, values)
        connection.commit()
        return {"message": "patient registered successfully"}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/registerDoctor")
def registerDoctor(auth_register: SignUpDoctor):
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        # Check if the email already exists in the Doctors table
        cursor.execute("SELECT * FROM Doctors WHERE Email = %s", (auth_register.Email,))
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        # Insert the new user into the Doctors table
        query = """
            INSERT INTO Doctors (DoctorName, DoctorInfo, DoctorSpecialty, Email, Password)
            VALUES (%s, %s, %s, %s, %s)
        """
        # values = (auth_register.DoctorId, auth_register.DoctorName, auth_register.DoctorInfo, auth_register.DoctorSpecialty, auth_register.Email, generate_password_hash(auth_register.Password))
        values = (auth_register.DoctorName, auth_register.DoctorInfo, auth_register.DoctorSpecialty, auth_register.Email, auth_register.Password) 
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Doctor registered successfully"}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

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
                       (input.DoctorId, input.PatienId, input.Date, next_5_days))
        appointments_in_blue = cursor.fetchall()
        cursor.execute("SELECT Date,startTime FROM Appointments WHERE DoctorId = %s AND PatientId != %s AND Date >= %s AND Date <= %s",
                       (input.DoctorId, input.PatienId, input.Date, next_5_days))
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