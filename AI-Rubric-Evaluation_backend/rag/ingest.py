
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from rag.knowledge_base import knowledge_documents


def create_vector_database():

    print("\nStarting document ingestion...")

    # Step 1: Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    chunks = text_splitter.split_documents(knowledge_documents)

    print(f"Total document chunks created: {len(chunks)}")

    # Step 2: Load free local embedding model
    print("\nLoading Hugging Face embedding model...")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    # Step 3: Create FAISS vector database
    print("\nCreating FAISS vector database...")

    vector_database = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )

    # Step 4: Save vector database locally
    vector_database.save_local("faiss_index")

    print("\nFAISS database created successfully!")
    print("Database location: faiss_index/")


if __name__ == "__main__":
    create_vector_database()


