from langchain_community.document_loaders import PyPDFLoader,DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Step 1:Load Raw Pdf

DATA_PATH = "data/"
def load_raw_pdf(data):
    loader=DirectoryLoader(data,
                           glob='*.pdf',
                           loader_cls=PyPDFLoader)
    documents=loader.load()
    return documents

documents=load_raw_pdf(DATA_PATH)
# print("Length of pdf pages:",len(documents))


#Step 2:Create Chunks
def create_chunks(documents):
    text_splitter=RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks=text_splitter.split_documents(documents)
    return chunks

text_chunks=create_chunks(documents)
#print("Length of chunks:",len(text_chunks))

#Step 3:Create Embeddings
def get_embeddng_model():
    embedding_model=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return embedding_model

embedding_model=get_embeddng_model()

#Step 4:Create Vector Store and store embeddings using FAISS
DB_FAISS_PATH="vectorStore/faiss_index"
db=FAISS.from_documents(text_chunks,embedding_model)
db.save_local(DB_FAISS_PATH)