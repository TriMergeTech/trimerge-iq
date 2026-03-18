import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from docx import Document

app = FastAPI()


def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    full_text = []

    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            full_text.append(paragraph.text)

    return "\n".join(full_text)


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

    raise HTTPException(status_code=400, detail="Only .docx supported in this version.")