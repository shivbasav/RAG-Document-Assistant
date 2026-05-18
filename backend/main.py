
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
import tempfile, os, json

from security import validate_user_input
from services.ingest import ingest_pdf
from services.query import answer_question, stream_question

limiter = Limiter(key_func=get_remote_address)
app     = FastAPI(title="RAG Document Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/ingest")
async def ingest(
    file:    UploadFile = File(...),
    user_id: str        = Form(...),
):
    if not file.filename or not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    filename = file.filename

    # Save to temp file, ingest, clean up
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(400, "File too large — max 10MB")
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = ingest_pdf(tmp_path, user_id=user_id, filename=filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ingest failed: {exc}")
    finally:
        os.unlink(tmp_path)

    return result

@app.get("/")
def root():
    return {"service": "RAG Document Assistant", "status": "ready"}

@app.post("/ask")
async def ask(payload: dict):
    query   = payload.get("query", "")
    user_id = payload.get("user_id", "")

    valid, error = validate_user_input(query)
    if not valid:
        raise HTTPException(400, error)

    return answer_question(query, user_id)

@app.get("/ask/stream")
async def ask_stream(query: str, user_id: str):
    valid, error = validate_user_input(query)
    if not valid:
        raise HTTPException(400, error)

    return StreamingResponse(
        stream_question(query, user_id),
        media_type="text/event-stream",
    )