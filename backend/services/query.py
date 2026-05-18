import json
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.genai.errors import ClientError
from services.gemini import embed_query, stream_answer
from services.pinecone_client import search
from security import detect_pii

def answer_question(query: str, user_id: str):
    """
    Full query pipeline:
    query -> embed -> search Pinecone -> generate answer
    Returns answer text + sources
    """
    # 1. Embedding the query
    query_vector = embed_query(query)

    # 2. Retrieve top 5 relevant chunks (filtering to this user only)
    matches = search(query_vector, user_id=user_id, top_k=5)

    if not matches:
        return {
            "answer":  "I couldn't find relevant information in your documents.",
            "sources": [],
        }

    # 3. Building context from retrieved chunks
    context_chunks = []
    sources        = []
    for match in matches:
        meta = match["metadata"]
        context_chunks.append(meta["text"])
        sources.append({
            "source": meta["source"],
            "page":   meta["page"],
            "score":  round(match["score"], 3),
        })

    # 4. Generating answer with Gemini
    answer = " ".join(list(stream_answer(query, context_chunks)))

    # checking output doesn't leak system internals
    if detect_pii(answer):
        answer = "I'm unable to provide that information."

    return {"answer": answer, "sources": sources}

def stream_question(query: str, user_id: str):
    """Generator for SSE streaming"""
    query_vector   = embed_query(query)
    matches        = search(query_vector, user_id=user_id, top_k=5)
    context_chunks = [m["metadata"]["text"] for m in matches]
    sources        = [{"source": m["metadata"]["source"], "page": m["metadata"]["page"]} for m in matches]
    payload = json.dumps({"type": "sources", "sources": sources})
    yield "data: " + payload + "\n\n"

    try:
        for token in stream_answer(query, context_chunks):
            safe_token = token.replace("\n", "\\n")
            payload = json.dumps({"type": "token", "text": safe_token})
            yield "data: " + payload + "\n\n"
    except ClientError as exc:
        payload = json.dumps({"type": "error", "message": str(exc)})
        yield f"data: {payload}\n\n"
    except Exception as exc:
        payload = json.dumps({"type": "error", "message": str(exc)})
        yield f"data: {payload}\n\n"

    yield "data: [DONE]\n\n"
