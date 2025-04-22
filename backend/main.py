from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from database_connection_service.db_connection import get_connection
from database_connection_service.classes_input import *
from datetime import datetime, timedelta, date
from medibot_RAG_service.mediBot import mediBotRag , initializeState, vector_store
from langgraph.types import Command
from langchain_community.document_loaders import PyPDFLoader
from tempfile import NamedTemporaryFile
from fastapi.middleware.cors import CORSMiddleware
from auth.classesInput import loginInput, SignUpPatient, SignUpDoctor
import os
from utilities.helperMain import RateLimiter
from fetch_news_service.fetch_news import fetch_articles
from bot_scheduler_service.bot_v2 import schedulerBotV2

# user information
config = {"configurable": {"thread_id": "1"}}
SECRET_KEY = os.getenv('SECRET_KEY')

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

### Helper Functions ###
def compute_week_bounds(appt_date: date):
    monday = appt_date - timedelta(days=appt_date.weekday())
    friday = monday + timedelta(days=4)
    return monday, friday

def find_weekly_appointment(patient_id: int, appt_date: date, doctorId: int) -> Optional[dict]:
    """
    Returns the first appointment row for this patient between Monday and Friday of the given week,
    or None if no such appointment exists.
    """
    monday, friday = compute_week_bounds(appt_date)
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        # Use a dict cursor so that fetchone() returns a dict
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, PatientId, DoctorId, Date, startTime
              FROM Appointments
             WHERE PatientId = %s
               AND Date BETWEEN %s AND %s 
               AND DoctorId = %s
            """,
            (patient_id, monday, friday, doctorId)
        )
        return cursor.fetchone()  # dict or None
    finally:
        cursor.close()
        conn.close()


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
        tables = ["Admin"] 
        user = None
        for table in tables:
            print(f"Checking table: {table}")
            cursor.execute(
                f"SELECT * FROM {table} WHERE Email = %s", (auth_request.email,))
            user = cursor.fetchone()
            print(f"User found: {user}")
            if user:
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
        return {"results": "Successfully logged in"}
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
        cursor.execute("SELECT * FROM Patients WHERE Email = %s", (auth_register.Email,))
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

@app.get("/patientNameGivenPatientId")
def getPatientNameGivenPatientId(PatientId:int): 
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT PatientName FROM Patients WHERE PatientId = %s", (PatientId,))
        patient_name = cursor.fetchone()
        if not patient_name:
            raise HTTPException(status_code=404, detail="Patient not found")
        return {"patient_name": patient_name['PatientName']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()
@app.get("/doctorNameGivenDoctorId")
def getDoctorNameGivenDoctorId(DoctorId:int):
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT DoctorName FROM Doctors WHERE DoctorId = %s", (DoctorId,))
        doctor_name = cursor.fetchone()
        if not doctor_name:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"doctor_name": doctor_name['DoctorName']}
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

@app.post("/insertAvailabilityofDoctor")
def insertAvailabilityofDoctor(input: insertAvailabilityofDoctorInput):
    '''
    Documentation: 
        - insert availibity of Doctor.
    '''
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        query = """

            INSERT INTO Appointments (DoctorId, Date, startTime)
            VALUES (%s, %s, %s)
        """
        values = (input.DoctorId, input.Date, input.startTime)
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Availability added successfully"}
    except Exception as e:  
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.delete("/deleteAvailabilityofDoctor")
def deleteAvailabilityofDoctor(input: DeleteAvailabilityOfDoctorInput):
    """
    Documentation:
        - delete availability of a doctor for a given date and start time.
    """
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        delete_query = """
            DELETE FROM Appointments
             WHERE DoctorId = %s
               AND Date     = %s
               AND startTime = %s
        """
        cursor.execute(delete_query, (input.DoctorId, input.Date, input.startTime))
        if cursor.rowcount == 0:
            # No matching row to delete
            raise HTTPException(status_code=404, detail="No matching availability found")
        connection.commit()
        return {"message": "Availability deleted successfully"}
    except HTTPException:
        # re‑raise 404 or other HTTPExceptions
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/checkIfAnotherAppointmentSameWeek")
def check_if_another_appointment_same_week(input: checkAppointmentInput):
    """
    Check if the given patient already has an appointment in the same Mon–Fri week, 
    """
    # 1) parse the date
    try:
        appt_date = datetime.fromisoformat(input.Date).date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Date must be in YYYY-MM-DD format")

    # 2) look up any existing appointment
    existing = find_weekly_appointment(input.PatientId, appt_date, input.DoctorId)
    return {
        "hasAppointment": existing is not None,
        "appointment": existing
    }

@app.post("/bookAppointment")
def book_appointment(input: bookAppointmentInput):
    """
    Book an existing availability slot by updating its PatientId.
    Enforces at most one appointment per patient Mon–Fri.
    """
    # 1) parse & validate the requested date
    try:
        appt_date = datetime.fromisoformat(input.Date).date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Date must be YYYY‑MM‑DD")

    # 2) enforce one‑per‑week rule
    existing = find_weekly_appointment(input.PatientId, appt_date, input.DoctorId)
    if existing:
        raise HTTPException(
            status_code=400,
            detail={
                "hasAppointment": True,
                "appointment": str(existing)
            }
        )

    # 3) perform the UPDATE instead of INSERT
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        # 3.1) Check if PatientId is available at this time
        cursor.execute(
            """
            SELECT DoctorId
              FROM Appointments
             WHERE PatientId  = %s
               AND Date      = %s
               AND startTime = %s
            """, 
            (input.PatientId, appt_date, input.startTime)
        )
        row = cursor.fetchone()
        if row:
            raise HTTPException(
            status_code=400,
            detail="Cannot book an appointment. You already have an appointment with another doctor at this time."
            )
        cursor.execute(
            """
            UPDATE Appointments
               SET PatientId = %s
             WHERE DoctorId  = %s
               AND Date      = %s
               AND startTime = %s
            """,
            (input.PatientId, input.DoctorId, appt_date, input.startTime)
        )

        # 4) if no row was updated, the slot doesn’t exist
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Doctor is not available at this time"
            )

        conn.commit()
        return {"message": "Appointment booked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

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
        - to delete an appointment between patient and doctor at a particular day and time, note: it will keep the doctor available during this time, so the doctor can be booked by other patients
    '''
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        query = """
            UPDATE Appointments
                SET PatientId = NULL
                WHERE PatientId = %s
                AND DoctorId  = %s
                AND Date      = %s
                AND startTime = %s

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

@app.post("/allAppointmentsForDoctor")
def allAppointmentsForDoctor(input: allAppointmentsForDoctorInput):
    """
    Documentation:
      - For a particular doctor, show all appointment slots for the
        next five days starting from `input.Date`.
      - Split into: 
         * appointment_null_patient  (no patient yet; but doctor available)
         * appointments_booked       (already booked)
    """
    # 1) parse the input date and compute the 5‑day window
    try:
        start_date = datetime.strptime(input.Date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Date must be YYYY‑MM‑DD")
    end_date = start_date + timedelta(days=5)

    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = conn.cursor()

        # 2) fetch all slots without a patient
        cursor.execute(
            """
            SELECT Date, startTime, feedback
              FROM Appointments
             WHERE DoctorId  = %s
               AND PatientId IS NULL
               AND Date BETWEEN %s AND %s
            """,
            (input.DoctorId, start_date, end_date)
        )
        appointment_null_patient = cursor.fetchall()

        # 3) fetch all slots already booked
        cursor.execute(
            """
            SELECT Date, startTime, PatientId, feedback
              FROM Appointments
             WHERE DoctorId    = %s
               AND PatientId  IS NOT NULL
               AND Date BETWEEN %s AND %s
            """,
            (input.DoctorId, start_date, end_date)
        )
        appointments_booked = cursor.fetchall()

        return {
            "appointment_null_patient": appointment_null_patient,
            "appointments_booked":     appointments_booked
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

@app.post("/availableforPatient")
def availableforPatient(input: availableforPatientInput):
    '''
    Documentation: 
        - to check if a doctor is available for the week return only the appointments that are not booked
    '''
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor()
        current_date = input.Date
        next_5_days = (datetime.strptime(current_date, "%Y-%m-%d") + timedelta(days=5)).strftime("%Y-%m-%d")
        cursor.execute("SELECT Date,startTime FROM Appointments WHERE DoctorId = %s AND PatientId IS NULL AND Date >= %s AND Date <= %s",
                       (input.DoctorId, input.Date, next_5_days))
        appointments = cursor.fetchall()
        return {"appointments_green": appointments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()
        
# Chatbot Endpoint:
@app.post("/addPDFToVB", dependencies=[Depends(RateLimiter(60, 60))])
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

@app.post("/mediBotRagEndpoint", dependencies=[Depends(RateLimiter(10, 60))])
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
@app.post("/schedulerBotEndpoint", dependencies=[Depends(RateLimiter(10, 60))])
def schedulerBotEndpoint(input:str, PatientId: str): 
    res,t = schedulerBotV2(input_message=input, PatientId=PatientId)
    return {"answer": res, "Doctor_Details": t}

# News 
@app.get("/news/MedicalField",summary="Medical Field News",description="Fetch the latest articles about Medical Field. Returns up to `page_size` items, each with a title and URL, and a small desciption of the article.", dependencies=[Depends(RateLimiter(60, 60))])
async def get_usd_news(page_size: int = Query(10, ge=1, le=100)):
    return fetch_articles("Medical Field News:", page_size)


# Donors: 
@app.post("/addDonation")
def add_donation(input: AddDonationInput):
    """
    Add a donation record to the Donors table.
    If a donor with the same email already exists, update their donation info.
    """
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO Donors (DonorName, DonorInfo, Email, PhoneNumber, AmountDonated, DonationDate, PrivateDonation)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                DonorName = VALUES(DonorName),
                DonorInfo = VALUES(DonorInfo),
                PhoneNumber = VALUES(PhoneNumber),
                AmountDonated = VALUES(AmountDonated),
                DonationDate = VALUES(DonationDate),
                PrivateDonation = VALUES(PrivateDonation)
            """,
            (
                input.DonorName,
                input.DonorInfo,
                input.Email,
                input.PhoneNumber,
                input.AmountDonated,
                input.DonationDate,
                input.PrivateDonation
            )
        )
        conn.commit()
        return {"message": "Donation recorded successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/getPublicDonations")
def get_public_donations():
    """
    Retrieve all donations that are not marked as private.
    Returns donor name, amount donated, and donation date.
    """
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT DonorName, AmountDonated, DonationDate
              FROM Donors
             WHERE PrivateDonation = FALSE
            """
        )
        donations = cursor.fetchall()
        return {"public_donations": donations}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()