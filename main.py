import os
import re
import uuid
from typing import List

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

# =========================
# STARTUP (ZERO BLOCKING)
# =========================
print("🚀 App booting instantly (no heavy imports)...")

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
app = FastAPI(title="AI Backend")

@app.on_event("startup")
def startup_event():
    print("✅ Server started. Ready to accept requests.")

# =========================
# GLOBAL LAZY OBJECTS
# =========================
_embedding = None
_tokenizer = None
_ocr = None
_chroma = None

# =========================
# LAZY LOADERS (ALL HEAVY)
# =========================
def get_embedder():
    global _embedding
    if _embedding is None:
        print("⚠️ Loading embedding model...")
        from sentence_transformers import SentenceTransformer
        _embedding = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _embedding


def get_tokenizer():
    global _tokenizer
    if _tokenizer is None:
        print("⚠️ Loading tokenizer...")
        from transformers import AutoTokenizer
        _tokenizer = AutoTokenizer.from_pretrained(EMBEDDING_MODEL_NAME)
    return _tokenizer


def get_ocr():
    global _ocr
    if _ocr is None:
        print("⚠️ Loading OCR...")
        from rapidocr_onnxruntime import RapidOCR
        _ocr = RapidOCR()
    return _ocr


def get_chroma():
    global _chroma
    if _chroma is None:
        print("⚠️ Initializing ChromaDB...")
        import chromadb
        _chroma = chromadb.PersistentClient(path=CHROMA_DIR)
    return _chroma


# =========================
# DB
# =========================
def get_collection(user_id: str):
    chroma = get_chroma()
    safe_id = re.sub(r"[^a-zA-Z0-9_-]", "_", user_id)
    return chroma.get_or_create_collection(name=f"user_{safe_id}")


# =========================
# MODELS
# =========================
class AskRequest(BaseModel):
    user_id: str
    question: str


# =========================
# HELPERS
# =========================
def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def extract_docx(path: str) -> str:
    from docx import Document
    doc = Document(path)
    return clean("\n".join(p.text for p in doc.paragraphs if p.text))


def extract_pdf(path: str) -> str:
    from pypdf import PdfReader

    reader = PdfReader(path)
    text = "\n".join(p.extract_text() or "" for p in reader.pages)

    if text.strip():
        return clean(text)

    # OCR fallback
    try:
        import fitz
        import numpy as np
        from PIL import Image

        ocr = get_ocr()
        doc = fitz.open(path)

        pages = []

        for page in doc:
            pix = page.get_pixmap()
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            result, _ = ocr(np.array(img))
            if result:
                pages.append(" ".join(r[1] for r in result))

        return clean("\n".join(pages))

    except Exception:
        return ""


def chunk(text: str) -> List[str]:
    try:
        tok = get_tokenizer()
        tokens = tok.encode(text, add_special_tokens=False)

        size = 200
        return [
            tok.decode(tokens[i:i + size]).strip()
            for i in range(0, len(tokens), size)
            if len(tok.decode(tokens[i:i + size]).strip()) > 20
        ]

    except Exception:
        return [
            text[i:i + 500].strip()
            for i in range(0, len(text), 500)
            if len(text[i:i + 500].strip()) > 20
        ]


def embed_text(chunks: List[str]) -> List[List[float]]:
    try:
        return get_embedder().encode(chunks).tolist()
    except Exception:
        return [[0.0] * 384 for _ in chunks]


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
    if not file.filename:
        raise HTTPException(400, "Missing filename")

    path = os.path.join(UPLOAD_DIR, file.filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    if file.filename.lower().endswith(".docx"):
        text = extract_docx(path)
    else:
        text = extract_pdf(path)

    if not text:
        raise HTTPException(400, "No text extracted")

    chunks = chunk(text)
    embeddings = embed_text(chunks)

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

    query_emb = embed_text([req.question])[0]
    res = col.query(query_embeddings=[query_emb], n_results=3)

    docs = res.get("documents", [[]])[0]

    if not docs:
        return {"answer": "No data found"}

    context = "\n\n".join(docs)

    if not OLLAMA_URL:
        return {"answer": context[:500]}

    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": context, "stream": False},
            timeout=120,
        )
        return {"answer": r.json().get("response", "")}
    except Exception:
        return {"answer": "LLM failed"}
