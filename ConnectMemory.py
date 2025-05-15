import os
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


#Step 1:Set up the LLM (Mistral)
HF_TOKEN=os.environ.get("HF_TOKEN")
HUGGINGFACE_REPO_ID="mistralai/Mistral-7B-Instruct-v0.3"
def load_llm(HUGGINGFACE_REPO_ID):
    llm=HuggingFaceEndpoint(
        repo_id= HUGGINGFACE_REPO_ID,
        temperature=0.5,
        max_new_tokens=512, 
        huggingfacehub_api_token=HF_TOKEN
    )
    return llm

#Step 2:Connect LLM with FAISS and create chain
CUSTOM_PROMPT_TEMPLATE="""
Use the pieces of information provideed in the context to answer user's question.
If you don't know the answer, say that you don't know.Don't try to make up an answer.
Dont provide anything out of given context.

Context:{context}
Question:{question}

Start the answer directly.No small talk please.
"""

def set_custom_prompt(custom_prompt_template):
    prompt=PromptTemplate(
        template=custom_prompt_template,
        input_variables=["context","question"]
    )
    return prompt

#Load Database
DB_FAISS_PATH="vectorStore/faiss_index"
embedding_model=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db=FAISS.load_local(DB_FAISS_PATH,embedding_model,allow_dangerous_deserialization=True)

#Create QA chain
qa_chain=RetrievalQA.from_chain_type(
    llm=load_llm(HUGGINGFACE_REPO_ID),
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True,
    chain_type_kwargs={"prompt":set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)}
)

#Now invoke (make chain active) with a single query
user_query=input("Enter your query:")
response=qa_chain.invoke({"query":user_query})
print("Response:",response['result'])
print("Source documents:",response['source_documents'])