# TriMerge AI Services: Gateway & Engine

This repository contains the Node.js/TypeScript API Gateway and the Python AI Engine. Together, they provide a secured infrastructure for document ingestion and AI interaction.

---

## 📌 System Architecture

| Service | Port | Responsibilities |
|---|---|---|
| **Gateway** | 3000 | Authentication, Routing, Logging |
| **AI Engine** | 5000 | Chat, Search, Document Ingestion |

---

## 📖 Documentation & Testing

- **Technical API Docs:** Run the Python engine and visit `http://localhost:5000/apidocs` to view the live Swagger/Flasgger documentation.
- **Manual Testing:** A complete Postman collection is provided in the `/postman-tests` folder for end-to-end verification.

---

## 🛡️ Gateway Responsibilities

| Feature | Description |
|---|---|
| **Authentication** | JWT-based security securing downstream AI services |
| **API Routing** | Clean routing to internal controllers and external services |
| **Logging** | Request and error logging via Winston and Morgan |
| **Rate Limiting** | Protection against DDoS and abuse |

---

## 🚀 Getting Started

### 1. Run the AI Engine (Python)
```bash
cd ai-engine
python app.py
```

### 2. Run the API Gateway (Node.js)
```bash
cd ai-gateway
npm install
npm run dev
```

---

## 🧪 Verified Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/ai/engine-check` | Basic health check for the Python engine | ❌ |
| `POST` | `/api/ai/chat` | Secured AI Chat | ✅ JWT |
| `GET` | `/api/ai/search` | Document search and knowledge retrieval | ✅ JWT |
| `POST` | `/api/ai/upload` | Document ingestion pipeline for PDF/Word files | ✅ JWT |