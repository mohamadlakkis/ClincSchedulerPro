from langchain_core.messages import HumanMessage,  SystemMessage
from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from medibot_RAG_service.prompts import *
import os
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

embeddings = OpenAIEmbeddings(model="text-embedding-3-small", api_key=OPENAI_API_KEY)

vector_store = Chroma(
    collection_name="430_collection",
    embedding_function=embeddings,
    persist_directory="/backend/chroma_430_vector_db",  # container path for the volume
)

model = ChatOpenAI(api_key = OPENAI_API_KEY , model = "gpt-4o", temperature=0, max_tokens = 4095)

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
    return state

def answerQuestion(state: userState) -> userState:
    global model, embeddings, vector_store
    question = state["userQuestions"][-1]
    results = vector_store.similarity_search(
        question, 
        k = 1 # nb of retreived documents
    ) # most similar results
    documents_added = True # this boolean, is to make sure to allow users to ask question to the LLM regardless if the Vector DB contain documents or not!
    if not results: 
        documents_added = False
    state["contextWindow"].append(HumanMessage(content=mediBotsystemPrompt(results, question, documents_added)))
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