
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


# Local FAISS database location
FAISS_INDEX_PATH = "faiss_index"


def load_vector_database():

    print("Loading embedding model...")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    print("Loading FAISS vector database...")

    vector_database = FAISS.load_local(
        FAISS_INDEX_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )

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


if __name__ == "__main__":

    test_query = "How can restaurants prevent food contamination?"

    results = retrieve_relevant_context(test_query)

    print("\nSEARCH QUERY:")
    print(test_query)

    print("\nRETRIEVED KNOWLEDGE:")

    for index, result in enumerate(results, start=1):

        print(f"\nResult {index}")
        print("Chapter:", result["metadata"]["chapter"])
        print("Distance:", round(result["distance"], 4))
        print("Content:", result["content"])
