from fastapi import FastAPI, HTTPException
from db_connection import get_connection

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello, World!"}

@app.get("/admins")
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
