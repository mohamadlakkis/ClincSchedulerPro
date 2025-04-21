from langchain_core.messages import HumanMessage,  SystemMessage
from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from database_connection_service.db_connection import get_connection
import os 
from fastapi import HTTPException
from bot_scheduler_service.prompts_v2 import * 
import json
from datetime import datetime

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

model = ChatOpenAI(api_key = OPENAI_API_KEY , model = "gpt-4o", temperature=0, max_tokens = 4095)

context_window = []
def get_today_date() -> str:
    return datetime.now().strftime("%Y-%m-%d")

def schedulerBotV2(PatientId: str, input_message:str) -> str: 
    global context_window, model
    if not context_window: 
        context_window.append(SystemMessage(systemPromptscheduler(PatientID=PatientId, today = get_today_date())))
    context_window.append(HumanMessage(messagePromptscheduler(user_message=input_message, PatientID=PatientId)))
    connection = get_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:
        cursor = connection.cursor(dictionary=True) # used dict = True to return the results as dict
        while True: 
            ai_message = model.invoke(context_window)
            context_window.append(ai_message)
            message_dict = json.loads(ai_message.content[7:-3]) 
            print(message_dict)
            if "chatbot_mode" in message_dict: 
                cursor.close()
                connection.close()
                t = None
                if "Doctor_Details" in message_dict:
                    t = message_dict["Doctor_Details"]
                return message_dict["chatbot_mode"], t
            query = message_dict["tool_mode"]
            cursor.execute(query)
            results = cursor.fetchall()
            connection.commit()
            context_window.append(HumanMessage(content = f"Me: Answer to your query: {results}"))
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        connection.close()
    
