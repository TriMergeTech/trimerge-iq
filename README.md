# AI Document Ingestion & Knowledge Engine (Backend)

## Overview

This project is a backend AI knowledge engine built using **Python (FastAPI)**.

It is designed to ingest documents, extract text, and prepare data for AI-powered search and question answering using a **local Large Language Model (LLM)** for privacy.

The system is being developed in structured phases to build a complete **Retrieval-Augmented Generation (RAG)** pipeline.

---

## Current Features

### Phase 1 – Document Upload & DOCX Extraction

* Upload documents via API (`POST /upload-document`)
* Support for **.docx files**
* Save uploaded documents locally
* Extract text from Word documents (paragraphs and tables)
* Preview extracted content
* Local AI endpoint (`POST /ask-ai`) using Ollama

---

### Phase 2 – PDF Support

* Added support for **.pdf file uploads**
* Extract text from PDF documents using `pypdf`
* Unified ingestion pipeline for DOCX and PDF

---

### Phase 3 – Text Chunking

* Split extracted document text into smaller chunks
* Return:

  * total number of chunks
  * preview of first chunk
* Prepares data for embeddings and semantic search

---

## Architecture

```
Swift (Frontend)
        │
        ▼
FastAPI Backend
        │
        ├── Upload Document
        ├── Save File
        ├── Detect File Type
        │
        ├── DOCX → Extract Text
        ├── PDF  → Extract Text
        │
        ▼
Chunk Text
        │
        ▼
Return JSON Response
```

---

## Document Ingestion Flow

```
User Uploads Document
        │
        ▼
POST /upload-document
        │
        ▼
Save File Locally
        │
        ▼
Check File Type
   ┌───────────────┬───────────────┐
   │               │
   ▼               ▼
 DOCX             PDF
   │               │
   ▼               ▼
Extract Text     Extract Text
   │               │
   └───────┬───────┘
           ▼
      Chunk Text
           │
           ▼
Return Chunk Data
```

---

## API Endpoints

### POST /upload-document

Uploads and processes documents.

**Supported file types:**

* `.docx`
* `.pdf`

**Response:**

```json
{
  "filename": "example.pdf",
  "message": "File uploaded, text extracted, and chunked successfully",
  "path": "uploads/example.pdf",
  "chunk_count": 5,
  "first_chunk_preview": "First part of extracted text..."
}
```

---

### POST /ask-ai

Sends a question to a locally running LLM (Ollama).

---

## Technology Stack

* **Backend:** FastAPI (Python)
* **Document Processing:**

  * python-docx
  * pypdf
* **AI Runtime:** Ollama (local LLM)
* **HTTP Requests:** requests

---

## Security & Privacy

* Uses **local LLM (Ollama)**
* No document data is sent externally
* Suitable for private/internal documents

---

## Project Status

### Completed

* Document upload API
* DOCX text extraction
* PDF text extraction
* Text chunking

### In Progress / Next Steps

* Generate embeddings
* Store embeddings in a vector database (Chroma)
* Build semantic search endpoint (`POST /search`)
* Implement Retrieval-Augmented Generation (RAG)

---

## Future Architecture

```
Upload Document
      ↓
Extract Text
      ↓
Chunk Text
      ↓
Generate Embeddings
      ↓
Store in Vector Database
      ↓
User Query
      ↓
Semantic Search
      ↓
Retrieve Relevant Chunks
      ↓
Send to LLM
      ↓
Generate Answer
```

---

## How to Run

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run backend

```bash
uvicorn main:app --reload
```

### Access API docs

```
http://127.0.0.1:8000/docs
```

---

## Author

**Griselda Bassette**
Backend Intern – AI Knowledge Engine
TriMerge Innovation Lab 2026
