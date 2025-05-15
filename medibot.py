import streamlit as st
import os
from langchain_huggingface import HuggingFaceEndpoint
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate

DB_FAISS_PATH="vectorStore/faiss_index"
st.cache_resource
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


def main():
    st.title("MediBot: Your Medical Assistant")
    if 'messages' not in st.session_state:
        st.session_state.messages = []
        
    for message in st.session_state.messages:
        st.chat_message(message["role"]).markdown(message["content"])
    
    prompt=st.chat_input("Ask me anything about your health:")
    if prompt:
        st.chat_message("user").markdown(prompt)
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        CUSTOM_PROMPT_TEMPLATE="""
                Use the pieces of information provideed in the context to answer user's question.
                If you don't know the answer, say that you don't know.Don't try to make up an answer.
                Dont provide anything out of given context.

                Context:{context}
                Question:{question}

                Start the answer directly.No small talk please.
                """
        HF_TOKEN=os.environ.get("HF_TOKEN")        
        HUGGINGFACE_REPO_ID="mistralai/Mistral-7B-Instruct-v0.3"  
        
        try:
            vectorstore=get_vectorstore()
            if vectorstore is None:
                st.error("Vectorstore not found.")
               
            qa_chain=RetrievalQA.from_chain_type(
                llm=load_llm(HUGGINGFACE_REPO_ID=HUGGINGFACE_REPO_ID,HF_TOKEN=HF_TOKEN),
                chain_type="stuff",
                retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
                return_source_documents=True,
                chain_type_kwargs={"prompt":set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)}
            ) 
            
            response=qa_chain.invoke({"query":prompt})
            result=response['result']
            source_documents=response['source_documents']
            result_to_show=result #+"\n\n"+str(source_documents)+"\n\n"
       
       
        except Exception as e:
            st.error(f"Error: {str(e)}")
            
        # response="Hi,I am MediBot, your medical assistant. I can help you with your health-related queries. Please provide me with some context or ask a specific question."
        st.chat_message("assistant").markdown(result_to_show)
        st.session_state.messages.append({"role": "assistant", "content": result_to_show})
        
if __name__ == "__main__":
    main()