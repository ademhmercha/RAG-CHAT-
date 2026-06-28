# RAG Chat

A fully local, free **Retrieval-Augmented Generation (RAG)** chat application with a ChatGPT-style UI. Uses **Ollama** (no OpenAI API key needed) and runs entirely via **Docker Compose**.

## Features

- **ChatGPT-style UI** — dark/light theme, conversation history, streaming-ready
- **100% Free & Local** — Ollama runs `llama3.2` (LLM) and `nomic-embed-text` (embeddings) on your machine
- **RAG Pipeline** — upload documents (PDF, DOCX, TXT, CSV, HTML, MD) → chunk → embed → store → retrieve → answer
- **Document Management** — upload, track status, delete documents (cleans vectors too)
- **Conversation History** — auto-titled, searchable, deletable
- **Async Upload** — upload returns immediately, ingestion runs in background
- **Docker Compose** — single command to spin up everything

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Nginx   │────▶│  Node.js │────▶│ MongoDB  │
│ (React)  │     │ (Express)│     │ (Auth,   │
│ :3001    │     │ :3000    │     │  Conv)   │
└──────────┘     └────┬─────┘     └──────────┘
                      │
              ┌───────┴───────┐
              ▼               ▼
         ┌──────────┐   ┌──────────┐
         │ Ollama   │   │ ChromaDB │
         │ :11434   │   │ :8000    │
         └──────────┘   └──────────┘
              │               │
         ┌────┴────┐    ┌────┴────┐
         │ llama3.2│    │ Vectors │
         │ nomic-  │    │ Store   │
         │ embed   │    └─────────┘
         └─────────┘
```

## Services

| Service    | Role                          | Port  |
|------------|-------------------------------|-------|
| `app`      | Node.js + Express API         | 3000  |
| `frontend` | React SPA served by Nginx     | 3001  |
| `mongo`    | MongoDB (auth, conversations) | 27017 |
| `chroma`   | ChromaDB (vector store)       | 8000  |
| `redis`    | Redis (cache / rate-limit)    | 6379  |
| `ollama`   | Ollama (LLM + embeddings)     | 11434 |

## Quick Start

```bash
# Clone
git clone <repo-url> && cd rag-chat

# Copy env
cp .env.example .env

# Start everything
docker compose up -d --build

# Wait for Ollama models to download (~5 min first time)
docker compose logs app -f

# Open
open http://localhost:3001
```

Ollama automatically pulls `llama3.2` (2 GB) and `nomic-embed-text` (274 MB) on first startup. Subsequent starts are instant.

## Environment Variables

| Variable                  | Description                   | Default                     |
|---------------------------|-------------------------------|-----------------------------|
| `PORT`                    | Server port                   | `3000`                      |
| `MONGODB_URI`             | MongoDB connection string     | `mongodb://mongo:27017`     |
| `JWT_SECRET`              | JWT signing secret            | —                           |
| `OLLAMA_HOST`             | Ollama server URL             | `http://ollama:11434`       |
| `OLLAMA_MODEL`            | LLM model name                | `llama3.2`                  |
| `OLLAMA_EMBEDDING_MODEL`  | Embedding model name          | `nomic-embed-text`          |
| `CHROMA_HOST`             | ChromaDB host                 | `chroma`                    |
| `CHROMA_PORT`             | ChromaDB port                 | `8000`                      |
| `REDIS_URL`               | Redis connection URL          | `redis://redis:6379`        |
| `JWT_EXPIRES_IN`          | JWT expiration duration       | `7d`                        |
| `MAX_FILE_SIZE`           | Max upload size in bytes      | `52428800` (50 MB)          |

## RAG Pipeline

```
Upload Document (PDF/DOCX/TXT/CSV/HTML/MD)
        │
        ▼
  Parse text ──► Clean & normalize ──► Chunk ──► Embed (Ollama) ──► Store in ChromaDB
                                                                         │
User Question ───────────────────────────────────────────────────────────┤
                                                                         │
        ◄──── Generate answer (Ollama) ◄──── Build prompt ◄──── Retrieve top chunks
```

## API Endpoints

| Method | Endpoint                   | Description                | Auth |
|--------|----------------------------|----------------------------|------|
| POST   | `/api/auth/register`       | Create account             | No   |
| POST   | `/api/auth/login`          | Sign in                    | No   |
| GET    | `/api/auth/me`             | Current user               | Yes  |
| POST   | `/api/chat`                | Ask a question (RAG)       | Yes  |
| GET    | `/api/conversations`       | List conversations         | Yes  |
| GET    | `/api/conversations/:id`   | Get conversation messages  | Yes  |
| PATCH  | `/api/conversations/:id`   | Rename conversation        | Yes  |
| DELETE | `/api/conversations/:id`   | Delete conversation        | Yes  |
| POST   | `/api/upload`              | Upload a document          | Yes  |
| GET    | `/api/documents`           | List documents             | Yes  |
| DELETE | `/api/documents/:id`       | Delete document + vectors  | Yes  |
| GET    | `/health`                  | Health check               | No   |

## Project Structure

```
├── frontend/              # React + Tailwind + Vite
│   ├── src/
│   │   ├── components/    # Chat, Documents, Layout
│   │   ├── context/       # AuthContext, ThemeContext
│   │   └── pages/         # Chat, Login, Register, Documents, Upload
│   ├── nginx.conf         # SPA fallback + API proxy
│   └── Dockerfile
├── src/
│   ├── api/               # Routes, Controllers, Validators
│   ├── ingestion/         # PDF, DOCX, HTML parsing
│   ├── chunking/          # Text chunking strategies
│   ├── embeddings/        # Ollama embedding client
│   ├── vectordb/          # ChromaDB client
│   ├── retrieval/         # Similarity search + reranking
│   ├── llm/               # Ollama LLM client
│   ├── services/          # Business logic
│   ├── models/            # Mongoose schemas
│   ├── middleware/         # Auth, error handling, upload
│   └── memory/            # Conversation history
├── docker-compose.yml     # All 6 services
├── Dockerfile             # Backend
└── .env.example
```
