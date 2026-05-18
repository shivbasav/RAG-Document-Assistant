import pdfplumber
import uuid
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.gemini import embed_text
from services.pinecone_client import upsert_chunks

def extract_text_from_pdf(file_path: str) -> list[dict]:
    """Extract text page by page from a PDF"""
    pages = []
    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and text.strip():
                pages.append({"page": i + 1, "text": text.strip()})
    return pages

def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks by word count"""
    words  = text.split()
    chunks = []
    start  = 0
    while start < len(words):
        end   = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start = end - overlap          # overlap keeps context across chunks
    return chunks

def ingest_pdf(file_path: str, user_id: str, filename: str) -> dict:
    """
    Full ingestion pipeline:
    PDF -> pages -> chunks -> embeddings -> Pinecone
    Returns stats about what was ingested
    """
    doc_id = str(uuid.uuid4())
    pages  = extract_text_from_pdf(file_path)

    if not pages:
        raise ValueError("Could not extract any text from this PDF")

    vectors       = []
    total_chunks  = 0

    for page_data in pages:
        chunks = chunk_text(page_data["text"])
        for i, chunk in enumerate(chunks):
            embedding = embed_text(chunk)
            vector_id = f"{doc_id}_p{page_data['page']}_c{i}"
            vectors.append({
                "id":     vector_id,
                "values": embedding,
                "metadata": {
                    "user_id":  user_id,
                    "doc_id":   doc_id,
                    "source":   filename,
                    "page":     page_data["page"],
                    "text":     chunk,        # stored for retrieval
                },
            })
            total_chunks += 1

    upsert_chunks(vectors)

    return {
        "doc_id":       doc_id,
        "filename":     filename,
        "pages":        len(pages),
        "total_chunks": total_chunks,
    }