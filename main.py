import os
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from docx import Document
from pypdf import PdfReader

app = FastAPI()


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


def ask_ollama(prompt: str) -> str:
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
    return response.json()["response"]


@app.get("/")
def home():
    return {"message": "AI Ingestion Backend Running"}


@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    if file.filename.lower().endswith(".docx"):
        extracted_text = extract_text_from_docx(file_path)

        return {
            "filename": file.filename,
            "message": "DOCX uploaded, saved, and text extracted successfully",
            "path": file_path,
            "extracted_text_preview": extracted_text[:1000]
        }

    elif file.filename.lower().endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_path)

        return {
            "filename": file.filename,
            "message": "PDF uploaded, saved, and text extracted successfully",
            "path": file_path,
            "extracted_text_preview": extracted_text[:1000]
        }

    raise HTTPException(
        status_code=400,
        detail="Only .docx and .pdf files are supported in this version."
    )


@app.post("/ask-ai")
async def ask_ai(question: str):
    answer = ask_ollama(question)
    return {
        "question": question,
        "answer": answer
    }
