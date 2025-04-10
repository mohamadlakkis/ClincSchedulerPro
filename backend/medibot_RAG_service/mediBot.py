from langchain_core.messages import HumanMessage,  SystemMessage
from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from medibot_RAG_service.prompts import *
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

model =   ChatOpenAI(api_key = OPENAI_API_KEY , model = "gpt-4o", temperature=0, max_tokens = 4095)

# State Definition
class userState(TypedDict):
    contextWindow: list[AnyMessage]
    userQuestions: list[str]
    answersAI: list[str]
    moreQuestions: bool

builder = StateGraph(userState)

# Node Definitions: only two main nodes 

def askQuestion(state: userState) -> userState: 
    question = interrupt("what is your question?")
    state["userQuestions"].append(question)
    state["contextWindow"].append(HumanMessage(content=question))
    return state

def answerQuestion(state: userState) -> userState:
    global model
    answer = model.invoke(state["contextWindow"])
    state["contextWindow"].append(answer)
    state["answersAI"].append(answer.content)
    return state

# Conditional Functions
def wants_to_continue_asking(state: userState) -> bool:
    return state["moreQuestions"]

# Node Creation: 
builder.add_node(askQuestion, "askQuestion")
builder.add_node(answerQuestion, "answerQuestion")

# Edge Creation:
builder.add_edge(START, "askQuestion")
builder.add_conditional_edges("askQuestion", wants_to_continue_asking, {True: "answerQuestion", False: END})
builder.add_edge("answerQuestion", "askQuestion")

# Compile
checkpointer = MemorySaver()
mediBotRag = builder.compile(checkpointer=checkpointer)

# State Initialization ( I created this to simplify the logic inside main.py. so now in main we are directly waiting for a question, and the state is ready )
def initializeState() -> userState:
    return {
        "contextWindow": [
            SystemMessage(content=mediBotRagSystemPrompt())
        ],
        "userQuestions": [], 
        "answersAI": [], 
        "moreQuestions": True
    }