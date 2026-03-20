import os
import requests
import chromadb
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from docx import Document
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

app = FastAPI()

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(name="documents")


class SearchRequest(BaseModel):
    query: str

class AskAIRequest(BaseModel):
    question: str


def reset_collection():
    global collection
    try:
        chroma_client.delete_collection(name="documents")
    except Exception:
        pass
    collection = chroma_client.get_or_create_collection(name="documents")


def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    full_text = []

    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            full_text.append(paragraph.text)

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    full_text.append(cell.text)

    return "\n".join(full_text)


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    full_text = []

    for page in reader.pages:
        text = page.extract_text()
        if text and text.strip():
            full_text.append(text)

    return "\n".join(full_text)


def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    chunks = []

    for i in range(0, len(text), chunk_size):
        chunk = text[i:i + chunk_size]
        if chunk.strip():
            chunks.append(chunk)

    return chunks


def generate_embeddings(chunks: list[str]) -> list[list[float]]:
    return embedding_model.encode(chunks).tolist()


def store_in_chroma(filename: str, chunks: list[str], embeddings: list[list[float]]):
    ids = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        ids.append(f"{filename}_chunk_{i}")
        metadatas.append({
            "filename": filename,
            "chunk_index": i
        })

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )


def ask_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3:4b",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )
        response.raise_for_status()
        return response.json().get("response", "No response returned from Ollama.")
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ollama request failed: {str(e)}"
        )


@app.get("/")
def home():
    return {"message": "AI Ingestion Backend Running"}


@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    reset_collection()

    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    if file.filename.lower().endswith(".docx"):
        extracted_text = extract_text_from_docx(file_path)
        chunks = chunk_text(extracted_text)

        if not chunks:
            raise HTTPException(status_code=400, detail="No text could be extracted from the DOCX file.")

        embeddings = generate_embeddings(chunks)
        store_in_chroma(file.filename, chunks, embeddings)

        return {
            "filename": file.filename,
            "message": "DOCX uploaded, text extracted, chunked, embedded, and stored successfully",
            "path": file_path,
            "chunk_count": len(chunks),
            "embedding_count": len(embeddings),
            "stored_in_vector_db": True,
            "first_chunk_preview": chunks[0][:500]
        }

    elif file.filename.lower().endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_path)
        chunks = chunk_text(extracted_text)

        if not chunks:
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF file.")

        embeddings = generate_embeddings(chunks)
        store_in_chroma(file.filename, chunks, embeddings)

        return {
            "filename": file.filename,
            "message": "PDF uploaded, text extracted, chunked, embedded, and stored successfully",
            "path": file_path,
            "chunk_count": len(chunks),
            "embedding_count": len(embeddings),
            "stored_in_vector_db": True,
            "first_chunk_preview": chunks[0][:500]
        }

    raise HTTPException(
        status_code=400,
        detail="Only .docx and .pdf files are supported in this version."
    )


@app.post("/search")
async def search_documents(request: SearchRequest):
    query_embedding = embedding_model.encode([request.query]).tolist()[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    return {
        "query": request.query,
        "results": results
    }


@app.post("/ask-ai")
async def ask_ai(request: AskAIRequest):
    query_embedding = embedding_model.encode([request.question]).tolist()[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    documents = results.get("documents", [])
    metadatas = results.get("metadatas", [])

    matched_chunks = documents[0] if documents and len(documents) > 0 else []
    matched_metadata = metadatas[0] if metadatas and len(metadatas) > 0 else []

    if not matched_chunks:
        return {
            "question": request.question,
            "answer": "The answer was not found in the uploaded document.",
            "source_chunks": [],
            "source_metadata": []
        }

    context = "\n\n".join(matched_chunks)

    prompt = f"""
You are answering based only on the document context below.

Document Context:
{context}

Question:
{request.question}

Instructions:
- Answer using only the document context.
- If the answer is not in the context, say: "The answer was not found in the uploaded document."
"""

    answer = ask_ollama(prompt)

    return {
        "question": request.question,
        "answer": answer,
        "source_chunks": matched_chunks,
        "source_metadata": matched_metadata
    }
     
   
