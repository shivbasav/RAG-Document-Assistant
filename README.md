# RAG Document Assistant

RAG Document Assistant is an AI-powered document question-answering system. It allows users to ask questions about uploaded documents and receive answers grounded in the document content.

Instead of sending the entire document to the AI model, the system retrieves only the most relevant parts of the document and uses them as context to generate accurate answers.

## What This Project Does

This project implements a Retrieval-Augmented Generation, or RAG, pipeline.

The system:

1. Takes document text
2. Splits it into smaller chunks
3. Converts each chunk into embeddings
4. Stores those embeddings for semantic search
5. Converts the user’s question into an embedding
6. Finds the most relevant document chunks
7. Sends those chunks to Gemini as context
8. Generates an answer based only on the retrieved context
9. Streams the answer back to the user

## Why This Project Matters

Large Language Models do not automatically know your private documents. They can also hallucinate when they do not have enough information.

This project solves that by combining:

- Document retrieval
- Semantic search
- Gemini embeddings
- Vector search
- Grounded answer generation
- Streaming responses

## Tech Stack

- Python
- Gemini API
- Google GenAI SDK
- Embeddings
- Vector Search
- RAG Architecture

## Core Features

- Document chunking
- Query embeddings
- Document embeddings
- Semantic similarity search
- Context-based answer generation
- Streaming AI responses
- Reduced hallucinations by grounding answers in retrieved text

## Project Flow

Document
   ↓
Text Chunking
   ↓
Embedding Generation
   ↓
Vector Storage
   ↓
User Question
   ↓
Query Embedding
   ↓
Similarity Search
   ↓
Relevant Context Retrieval
   ↓
Gemini Response Generation
   ↓
Streamed Answer


## What I Learned

Through this project, I learned how modern AI document assistants work under the hood.

This project helped me understand:

How embeddings represent text meaning
How semantic search works
Why RAG reduces hallucinations
How to build grounded AI responses
How to stream LLM responses
How retrieval and generation work together
Future Improvements
Add PDF upload support
Add a React frontend
Add ChromaDB or FAISS for vector storage
Add citations with source highlighting
Add user authentication
Add chat history
Deploy the app online
Summary

This project is not just a chatbot. It is a basic AI knowledge retrieval system that combines semantic search with LLM-based answer generation.