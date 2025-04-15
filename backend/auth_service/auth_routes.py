from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta
from .auth_models import UserLogin, UserSignup, Token
from .auth_utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    verify_token,
)
from database_connection_service.db_connection import get_connection
import uuid

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Try to find user in all possible tables
        tables = ['Admin', 'Doctors', 'Patients']
        user = None
        user_type = None
        
        for table in tables:
            cursor.execute(f"SELECT * FROM {table} WHERE Email = %s", (user_data.email,))
            result = cursor.fetchone()
            if result:
                user = result
                user_type = table.lower().rstrip('s')  # Convert 'Doctors' to 'doctor'
                break
        
        if not user or not verify_password(user_data.password, user['password']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(user)
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data.email, "user_type": user_type},
            expires_delta=access_token_expires,
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": user_type
        }
    
    finally:
        cursor.close()
        connection.close()

@router.post("/signup", response_model=Token)
async def signup(user_data: UserSignup):
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if email already exists in any table
        tables = ['Admin', 'Doctors', 'Patients']
        for table in tables:
            cursor.execute(f"SELECT Email FROM {table} WHERE Email = %s", (user_data.email,))
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Hash the password
        hashed_password = get_password_hash(user_data.password)
        
        # Insert based on user type
        if user_data.user_type == "admin":
            cursor.execute(
                "INSERT INTO Admin (name, email, password) VALUES (%s, %s, %s)",
                (user_data.name, user_data.email, hashed_password)
            )
        elif user_data.user_type == "doctor":
            doctor_id = f"DOC{uuid.uuid4().hex[:6].upper()}"
            cursor.execute(
                """INSERT INTO Doctors 
                (DoctorId, DoctorName, DoctorInfo, DoctorSpecialty, Email, Password)
                VALUES (%s, %s, %s, %s, %s, %s)""",
                (doctor_id, user_data.name, user_data.info or "",
                 user_data.specialty or "", user_data.email, hashed_password)
            )
        elif user_data.user_type == "patient":
            patient_id = f"PAT{uuid.uuid4().hex[:6].upper()}"
            cursor.execute(
                """INSERT INTO Patients
                (PatientId, PatientName, PatientInfo, PatientAge, Gender, Email, Password)
                VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (patient_id, user_data.name, user_data.info or "",
                 user_data.age or 0, user_data.gender or "", 
                 user_data.email, hashed_password)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user type"
            )
        
        connection.commit()
        
        # Generate access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data.email, "user_type": user_data.user_type},
            expires_delta=access_token_expires,
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": user_data.user_type
        }
    
    finally:
        cursor.close()
        connection.close()
