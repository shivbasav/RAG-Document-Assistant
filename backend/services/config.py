from dotenv import load_dotenv;
import os

load_dotenv();

GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX   = os.getenv("PINECONE_INDEX", "rag-docs")
PINECONE_CLOUD   = os.getenv("PINECONE_CLOUD")
PINECONE_REGION  = os.getenv("PINECONE_REGION")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY missing from .env")
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY missing from .env")
if not PINECONE_CLOUD:
    raise ValueError("PINECONE_CLOUD missing from .env")
if not PINECONE_REGION:
    raise ValueError("PINECONE_REGION missing from .env")