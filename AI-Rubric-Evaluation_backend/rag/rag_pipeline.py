
from pathlib import Path
from functools import lru_cache

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


# Resolve the FAISS index relative to the backend directory.
BACKEND_DIR = Path(__file__).resolve().parent.parent
FAISS_INDEX_PATH = BACKEND_DIR / "faiss_index"


@lru_cache(maxsize=1)
def load_vector_database():

    print("Loading embedding model...")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    print("Loading FAISS vector database...")

    if not FAISS_INDEX_PATH.exists():
        raise FileNotFoundError(
            f"FAISS index directory not found: {FAISS_INDEX_PATH}"
        )

    vector_database = FAISS.load_local(
        str(FAISS_INDEX_PATH),
        embeddings,
        allow_dangerous_deserialization=True
    )

    print("FAISS vector database loaded successfully!")

    return vector_database


def retrieve_relevant_context(query: str, k: int = 3):

    if not query or not query.strip():
        raise ValueError("Search query cannot be empty.")

    vector_database = load_vector_database()

    results = vector_database.similarity_search_with_score(
        query,
        k=k
    )

    retrieved_context = []

    for document, score in results:

        retrieved_context.append({
            "content": document.page_content,
            "metadata": document.metadata,
            "distance": float(score)
        })

    return retrieved_context
