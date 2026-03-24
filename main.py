import os
import re
import uuid
from typing import List

import chromadb
import fitz
import numpy as np
import requests
from docx import Document
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image
from pydantic import BaseModel
from pypdf import PdfReader
from rapidocr_onnxruntime import RapidOCR
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer

# =========================
# ENV
# =========================
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads")
CHROMA_DIR = os.getenv("CHROMA_DIR", "/tmp/chroma")
OLLAMA_URL = os.getenv("OLLAMA_URL", "").strip()
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)

# =========================
# APP
# =========================
app = FastAPI()

# =========================
# LAZY MODELS
# =========================
_embedding = None
_tokenizer = None
_ocr = None

def get_embedder():
    global _embedding
    if _embedding is None:
        _embedding = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _embedding

def get_tokenizer():
    global _tokenizer
    if _tokenizer is None:
        _tokenizer = AutoTokenizer.from_pretrained(EMBEDDING_MODEL_NAME)
    return _tokenizer

def get_ocr():
    global _ocr
    if _ocr is None:
        _ocr = RapidOCR()
    return _ocr

# =========================
# DB
# =========================
chroma = chromadb.PersistentClient(path=CHROMA_DIR)

def get_collection(user_id):
    return chroma.get_or_create_collection(name=f"user_{user_id}")

# =========================
# MODELS
# =========================
class AskRequest(BaseModel):
    user_id: str
    question: str

# =========================
# HELPERS
# =========================
def clean(text):
    return re.sub(r"\s+", " ", text).strip()

def extract_docx(path):
    doc = Document(path)
    return clean("\n".join([p.text for p in doc.paragraphs if p.text]))

def extract_pdf(path):
    reader = PdfReader(path)
    text = "\n".join([p.extract_text() or "" for p in reader.pages])

    if text.strip():
        return clean(text)

    # OCR fallback
    doc = fitz.open(path)
    ocr = get_ocr()
    pages = []

    for p in doc:
        pix = p.get_pixmap()
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        result, _ = ocr(np.array(img))
        if result:
            pages.append(" ".join([r[1] for r in result]))

    return clean("\n".join(pages))

def chunk(text):
    tok = get_tokenizer()
    tokens = tok.encode(text, add_special_tokens=False)

    size = 200
    chunks = []

    for i in range(0, len(tokens), size):
        part = tok.decode(tokens[i:i+size])
        if len(part.strip()) > 20:
            chunks.append(part)

    return chunks

# =========================
# ROUTES
# =========================
@app.get("/")
def home():
    return {"status": "running"}

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/upload")
async def upload(user_id: str = Form(...), file: UploadFile = File(...)):
    path = os.path.join(UPLOAD_DIR, file.filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    if file.filename.endswith(".docx"):
        text = extract_docx(path)
    else:
        text = extract_pdf(path)

    if not text:
        raise HTTPException(400, "No text extracted")

    chunks = chunk(text)
    embeddings = get_embedder().encode(chunks).tolist()

    col = get_collection(user_id)
    col.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[str(uuid.uuid4()) for _ in chunks],
    )

    return {"chunks": len(chunks)}

@app.post("/ask")
def ask(req: AskRequest):
    col = get_collection(req.user_id)

    query_emb = get_embedder().encode([req.question])[0]

    res = col.query(query_embeddings=[query_emb], n_results=3)

    docs = res.get("documents", [[]])[0]

    if not docs:
        return {"answer": "No data found"}

    context = "\n\n".join(docs)

    if not OLLAMA_URL:
        return {"answer": context[:500]}

    prompt = f"""
Answer ONLY from context.

{context}

Question: {req.question}
"""

    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=120,
        )
        return {"answer": r.json().get("response", "")}
    except Exception:
        return {"answer": "LLM failed"}
