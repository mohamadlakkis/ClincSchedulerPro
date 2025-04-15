from langchain_core.messages import HumanMessage,  SystemMessage
from langchain_openai import ChatOpenAI
from database_connection_service.db_connection import get_connection
from bot_scheduler_service.prompts import *
import json
from fastapi import HTTPException
import os

OPENAI_API_KEY= os.getenv("OPENAI_API_KEY")

model = ChatOpenAI(api_key = OPENAI_API_KEY , model = "gpt-4o", temperature=0, max_tokens = 4095)

contextWindowScheduler = [SystemMessage(content = systemPromptscheduler())]


# Get the list of doctors from the database and put it in the prompt
def get_doctors_list():
    connection = get_connection()
    results = {}
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True) # used dict = True to return the results as dict
        cursor.execute("SELECT DoctorId, DoctorName FROM Doctors")
        results = cursor.fetchall()
        connection.commit()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        connection.close()
    return results
ALL_DOCTORS = get_doctors_list()

def schedulerBotFunction(user_message: str, PatientID: str) -> str: 
    """
    This function is used to get the answer from the bot, and it will return the answer.
    """
    global contextWindowScheduler, model, ALL_DOCTORS
    if len(contextWindowScheduler) == 1: # the user is asking for the first time
        contextWindowScheduler.append(HumanMessage(content = messagePromptscheduler(user_message, PatientID, ALL_DOCTORS)))
    else: # add the message as is, do not need to rewrite the while messagePromptscheduler
        contextWindowScheduler.append(HumanMessage(content = f"#############User Message/Reply: {user_message}"))
    ai_message = model.invoke(contextWindowScheduler)
    contextWindowScheduler.append(ai_message)
    message_dict = json.loads(ai_message.content[7:-3]) 
    print(message_dict)
    if message_dict['chatting'] == 'true' or message_dict['chatting']==True: 
        return message_dict['chatting_message']
    elif message_dict['need_more_info'] == 'true' or message_dict['need_more_info']==True:
        return message_dict['message']
    # need_more_info = false; and chatting = false
    try: 
        query_to_run = message_dict['query_information']['query']
    except Exception as e:
        return HTTPException(status_code=500, detail="Error in query parsing from dict")
    # run the query
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True) # used dict = True to return the results as dict
        cursor.execute(query_to_run)
        results = cursor.fetchall()
        connection.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()
    # Give the results back to the LLM
    contextWindowScheduler.append(HumanMessage(content = f"Results of the query you asked for: {results}"))
    # Now we need to get the answer from the bot
    ai_message = model.invoke(contextWindowScheduler)
    contextWindowScheduler.append(ai_message)
    message_dict = json.loads(ai_message.content[7:-3]) 
    # Now we need to return the answer to the user
    return message_dict['query_results']
    