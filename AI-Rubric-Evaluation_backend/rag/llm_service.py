
from langchain_ollama import ChatOllama


# Initialize our local language model
llm = ChatOllama(
    model="qwen2.5:1.5b",
    temperature=0.1
)


def generate_ai_response(prompt: str) -> str:

    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    response = llm.invoke(prompt)

    return response.content


if __name__ == "__main__":

    test_prompt = """
    You are an expert restaurant operations evaluator.

    Explain the importance of FIFO inventory management
    in a restaurant in simple terms.
    """

    print("Sending prompt to local AI model...")

    result = generate_ai_response(test_prompt)

    print("\nAI RESPONSE:")
    print(result)
