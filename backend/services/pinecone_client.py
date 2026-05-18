from pinecone import Pinecone, ServerlessSpec
from pinecone.errors.exceptions import NotFoundError
from services.config import (
    PINECONE_API_KEY,
    PINECONE_INDEX,
    PINECONE_CLOUD,
    PINECONE_REGION,
)

pc = Pinecone(api_key=PINECONE_API_KEY)
_index = None


def get_index(dimension: int | None = None):
    global _index
    if _index is not None:
        return _index

    try:
        _index = pc.index(PINECONE_INDEX)
    except NotFoundError:
        if dimension is None:
            raise RuntimeError(
                f"Pinecone index '{PINECONE_INDEX}' not found and no dimension was provided for creation"
            )

        spec = ServerlessSpec(
            cloud=PINECONE_CLOUD,
            region=PINECONE_REGION,
        )
        pc.indexes.create(
            name=PINECONE_INDEX,
            spec=spec,
            dimension=dimension,
            metric="cosine",
        )
        _index = pc.index(PINECONE_INDEX)

    return _index


def upsert_chunks(chunks: list[dict]):
    """
    chunks = [
        {"id": "doc1_chunk_0", "values": [0.1, ...], 
         "metadata": {"user_id": "u1", "source": "file.pdf", "page": 1, "text": "..."}}
    ]
    """
    if not chunks:
        return

    first_dim = len(chunks[0]["values"])
    if any(len(chunk["values"]) != first_dim for chunk in chunks):
        raise ValueError("All chunk vectors must have the same dimensionality")

    get_index(dimension=first_dim).upsert(vectors=chunks)

def search(query_vector: list[float], user_id: str, top_k: int = 5) -> list[dict]:
    """Search only within this user's namespace — isolation key"""
    results = get_index().query(
        vector=query_vector,
        top_k=top_k,
        filter={"user_id": {"$eq": user_id}},  # security: user sees only their docs
        include_metadata=True,
    )
    return [match.to_dict() for match in results.matches]

def delete_document(doc_id: str, user_id: str):
    """Delete all chunks for a document — filter by both for safety"""
    get_index().delete(filter={"doc_id": {"$eq": doc_id}, "user_id": {"$eq": user_id}})