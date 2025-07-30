import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings

# Load .env variables (GROQ_API_KEY expected)
load_dotenv()

DB_FAISS_PATH = "vectorStore/faiss_index"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_vectorstore():
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)
    return db

def set_custom_prompt(custom_prompt_template):
    prompt = PromptTemplate(
        template=custom_prompt_template,
        input_variables=["context", "question"]
    )
    return prompt

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    question = body.get("message")

    if not question:
        return {"response": "Please provide a question."}

    CUSTOM_PROMPT_TEMPLATE = """
    Use the pieces of information provided in the context to answer user's question.
    If you don't know the answer, say that you don't know. Don't try to make up an answer.
    Don't provide anything out of the given context.

    Context: {context}
    Question: {question}

    Start the answer directly. No small talk please.
    """

    try:
        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            return {"response": "GROQ_API_KEY is not set in the environment."}

        vectorstore = get_vectorstore()
        if not vectorstore:
            return {"response": "Vector store failed to load."}

        qa_chain = RetrievalQA.from_chain_type(
            llm=ChatGroq(
                model_name="meta-llama/llama-4-maverick-17b-128e-instruct",
                temperature=0.0,
                groq_api_key=groq_api_key,
            ),
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={'k': 3}),
            return_source_documents=False,
            chain_type_kwargs={'prompt': set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)}
        )

        result = qa_chain.invoke({'query': question})
        return {"response": result["result"]}

    except Exception as e:
        return {"error": str(e)}
