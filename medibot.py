import streamlit as st
from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
import os
from langchain_huggingface import HuggingFaceEndpoint
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate

DB_FAISS_PATH="vectorStore/faiss_index"
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
def get_vectorstore():
    embedding_model=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db=FAISS.load_local(DB_FAISS_PATH,embedding_model,allow_dangerous_deserialization=True)
    return db

def set_custom_prompt(custom_prompt_template):
    prompt=PromptTemplate(
        template=custom_prompt_template,
        input_variables=["context","question"]
    )
    return prompt

def load_llm(HUGGINGFACE_REPO_ID,HF_TOKEN):
    llm=HuggingFaceEndpoint(
        repo_id= HUGGINGFACE_REPO_ID,
        temperature=0.5,
        max_new_tokens=512, 
        huggingfacehub_api_token=HF_TOKEN
    )
    return llm
    
    
    
@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    question = body.get("message")

    HF_TOKEN = os.environ.get("HF_TOKEN")
    HUGGINGFACE_REPO_ID = "mistralai/Mistral-7B-Instruct-v0.3"

    CUSTOM_PROMPT_TEMPLATE = """
    Use the pieces of information provided in the context to answer user's question.
    If you don't know the answer, say that you don't know. Don't try to make up an answer.
    Don't provide anything out of the given context.

    Context: {context}
    Question: {question}

    Start the answer directly. No small talk please.
    """

    vectorstore = get_vectorstore()
    qa_chain = RetrievalQA.from_chain_type(
        llm=load_llm(HUGGINGFACE_REPO_ID, HF_TOKEN),
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        return_source_documents=False,
        chain_type_kwargs={"prompt": set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)}
    )

    result = qa_chain.invoke({"query": question})
    return {"response": result["result"]}