def mediBotRagSystemPrompt():
    return """You are a professional assistant that answer a queetion, based on documents provided to you."""

def mediBotsystemPrompt(docs: list, question:str, documents_added:bool) -> str: 
    JOINED = ""
    for i,doc in enumerate(docs, start = 1):
        JOINED += f"Document {i}: {doc.page_content}\n\n\n"
    return f"""You need to answer a given question based on the provided documents: 
    Question: {question}
    ---------------------------------------------------Docs Provided
    {JOINED}
    """ if documents_added else f""" 
    You are a professional doctor, you need to answer this question {question} based on the best of your ability, if you do not know something, please say "I do not know".
    """