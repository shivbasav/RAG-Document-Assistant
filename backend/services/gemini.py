from google import genai
from google.genai import types
from services.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

CHAT_MODEL = "gemini-2.0-flash"
EMBEDDING_MODEL = "gemini-embedding-001"

def embed_text(text: str) -> list[float]:
    """Embed a document chunk for storage"""
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
    )
    embeddings = result.embeddings
    if not embeddings or not embeddings[0].values:
        raise ValueError("Embedding response returned no values")
    return embeddings[0].values

def embed_query(text: str) -> list[float]:
    """Embed a search query — different task_type matters for quality"""
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
    )
    embeddings = result.embeddings
    if not embeddings or not embeddings[0].values:
        raise ValueError("Embedding response returned no values")
    return embeddings[0].values

def generate_answer(query: str, context_chunks: list[str]) -> str:
    """Generate a cited answer from retrieved chunks"""
    context = "\n\n---\n\n".join(context_chunks)

    prompt = f"""You are a helpful document assistant. Answer the question using ONLY 
the context below. If the answer is not in the context, say so clearly.
Always mention which part of the context supports your answer.

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""

    response = client.models.generate_content(
        model=CHAT_MODEL,
        contents=prompt,
    )
    if response.text is None:
        raise ValueError("Generation response returned no text")
    return response.text

def stream_answer(query: str, context_chunks: list[str]):
    """Stream answer token by token for SSE"""
    context = "\n\n---\n\n".join(context_chunks)

    prompt = f"""You are a helpful document assistant. Answer the question using ONLY 
the context below. Always mention which part of the context supports your answer.

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""

    for chunk in client.models.generate_content_stream(
        model=CHAT_MODEL,
        contents=prompt,
    ):
        if chunk.text:
            yield chunk.text