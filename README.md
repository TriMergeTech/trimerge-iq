# AI Document Ingestion & Knowledge Engine (Backend)

## Overview

This project is a backend AI knowledge engine built using **Python (FastAPI)**.
It ingests documents, extracts text, generates embeddings, stores them in a vector database, and enables AI-powered question answering using a **local LLM (Ollama)**.

The system follows a **Retrieval-Augmented Generation (RAG)** architecture, allowing users to query documents and receive context-based answers.

---

## Tech Stack

* **Backend Framework:** FastAPI
* **Language:** Python 3.11
* **LLM:** Ollama (gemma3:4b)
* **Embeddings:** SentenceTransformers (all-MiniLM-L6-v2)
* **Vector Database:** ChromaDB
* **Document Parsing:** python-docx, pypdf
* **API Testing:** Swagger UI

---

## System Architecture

```
Upload Document → Extract Text → Chunk Text → Generate Embeddings → Store in Vector DB → Search → AI Answer
```

---

# Phase 1: Basic Document Upload & DOCX Extraction

### Features:

* Upload `.docx` files
* Extract text from paragraphs and tables
* Save files locally
* Preview extracted content

### Endpoint:

* `POST /upload-document`

---

# Phase 2: PDF Support Added

### Features:

* Upload `.pdf` files
* Extract text using PyPDF
* Unified handling for DOCX + PDF

### Improvements:

* Multi-format ingestion
* Cleaner extraction logic

---

# Phase 3: Text Chunking

### Features:

* Split extracted text into chunks (default: 500 characters)
* Prepare data for embeddings

### Why:

* Improves search accuracy
* Enables semantic matching

---

# Phase 4: Embeddings Generation

### Features:

* Convert text chunks into vector embeddings
* Use SentenceTransformers model

### Output:

* Each chunk → embedding vector

---

# Phase 5: Vector Database Integration (ChromaDB)

### Features:

* Store embeddings in ChromaDB
* Attach metadata (filename, chunk index)

### Result:

* Persistent searchable knowledge base

---

# Phase 6: Semantic Search API

### Features:

* Accept user query
* Convert query to embedding
* Retrieve top matching chunks

### Endpoint:

* `POST /search`

### Example Request:

```json
{
  "query": "practice plans"
}
```

---

# Phase 7: AI-Powered Question Answering (RAG)

### Features:

* Retrieve relevant chunks from ChromaDB
* Build contextual prompt
* Send to Ollama (local LLM)
* Return grounded answer

### Endpoint:

* `POST /ask-ai`

### Example Request:

```json
{
  "question": "What does this document say about practice plans?"
}
```

### Response Includes:

* AI-generated answer
* Source chunks
* Metadata

---

## API Endpoints Summary

| Endpoint           | Method | Description                  |
| ------------------ | ------ | ---------------------------- |
| `/`                | GET    | Health check                 |
| `/upload-document` | POST   | Upload and process documents |
| `/search`          | POST   | Semantic search              |
| `/ask-ai`          | POST   | AI-powered document Q&A      |

---

## How to Run Locally

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Start Ollama

```bash
ollama run gemma3:4b
```

### 3. Run FastAPI

```bash
uvicorn main:app --reload
```

### 4. Open Swagger UI

```
http://127.0.0.1:8000/docs
```

---

## How to Use

### Step 1: Upload a document

Use `/upload-document` and upload a PDF or DOCX file.

### Step 2: Search document

Use `/search` with a query.

### Step 3: Ask AI questions

Use `/ask-ai` to get answers based on document content.

---

## Project Status

✅ Document ingestion
✅ PDF + DOCX support
✅ Chunking
✅ Embeddings
✅ Vector database (ChromaDB)
✅ Semantic search
✅ AI question answering (RAG)

---

## Future Improvements

* Deploy backend to Render
* Connect frontend (Angular)
* Add authentication
* Persistent vector storage
* Multi-document querying
* UI for document browsing

---

## Author

Griselda Bassette – Backend 
Intern at TriMerge Consulting Group (AI + Knowledge Engine)

