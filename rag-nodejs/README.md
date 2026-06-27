# rag-nodejs

A production-ready **Retrieval-Augmented Generation (RAG)** system built with Node.js, Express, MongoDB, ChromaDB, and OpenAI.

## Architecture

The project follows **Clean Architecture** principles with strict **Separation of Concerns**:

```
Client Request
    │
    ▼
Routes ──► Controllers ──► Middleware
                                │
                                ▼
                          Services (Business Logic)
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
        Repositories        LLM Client        Vector Store
              │                 │                 │
              ▼                 ▼                 ▼
          MongoDB             OpenAI            ChromaDB
```

## Folder Structure

| Directory          | Responsibility                                    |
|--------------------|---------------------------------------------------|
| `config/`          | Centralized configuration for DB, LLM, etc.       |
| `src/api/routes/`  | Express route definitions                         |
| `src/api/controllers/` | Request/response handling (thin layer)        |
| `src/api/validators/` | Request payload validation                     |
| `src/middleware/`   | Auth, error handling, logging, upload, rate-limit |
| `src/ingestion/`    | Extract text from PDFs, Word, HTML, URLs, etc.    |
| `src/preprocessing/` | Clean, normalize, detect language of text        |
| `src/chunking/`     | Split text into chunks (recursive, semantic)      |
| `src/embeddings/`   | Generate vector embeddings via OpenAI             |
| `src/vectordb/`     | ChromaDB client — store and query vectors         |
| `src/retrieval/`    | Similarity search, reranking, retrieval pipeline  |
| `src/prompts/`      | Centralized prompt templates                      |
| `src/llm/`          | LLM client (OpenAI) — prompt completion           |
| `src/memory/`       | Conversation memory / history tracking            |
| `src/services/`     | Business logic layer — orchestrates pipeline      |
| `src/repositories/` | MongoDB data access (Mongoose models)             |
| `src/database/`     | MongoDB connection setup                          |
| `src/models/`       | Mongoose schemas (User, Document, Conversation)   |
| `src/sockets/`      | Socket.io real-time event handling                |
| `src/cache/`        | Redis caching layer                               |
| `src/storage/`      | Local filesystem storage for uploads              |
| `src/utils/`        | Shared utilities (helpers, constants, logger)     |
| `src/exceptions/`   | Custom error classes                              |

## Installation

```bash
# Clone the repository
git clone <repo-url> && cd rag-nodejs

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your values (MongoDB URI, OpenAI key, etc.)
```

## Running the Project

```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## Environment Variables

| Variable                  | Description                   | Default                     |
|---------------------------|-------------------------------|-----------------------------|
| `PORT`                    | Server port                   | `3000`                      |
| `MONGODB_URI`             | MongoDB connection string     | `mongodb://localhost:27017` |
| `JWT_SECRET`              | JWT signing secret            | —                           |
| `JWT_EXPIRES_IN`          | JWT expiration duration       | `7d`                        |
| `OPENAI_API_KEY`          | OpenAI API key                | —                           |
| `OPENAI_MODEL`            | LLM model name                | `gpt-4o-mini`               |
| `OPENAI_EMBEDDING_MODEL`  | Embedding model name          | `text-embedding-3-small`    |
| `CHROMA_HOST`             | ChromaDB host                 | `localhost`                 |
| `CHROMA_PORT`             | ChromaDB port                 | `8000`                      |
| `REDIS_URL`               | Redis connection URL          | `redis://localhost:6379`    |
| `LOG_LEVEL`               | Winston log level             | `info`                      |

## RAG Pipeline

```
PDF / Word / TXT / CSV / HTML / URL / YouTube
                    │
                    ▼
          ┌─────────────────┐
          │   Ingestion     │  Extract raw text
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │  Preprocessing  │  Clean & normalize text
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │    Chunking     │  Split into chunks
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │   Embeddings    │  Generate vectors (OpenAI)
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │   ChromaDB      │  Store vectors
          └────────┬────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   User Question       Generate Query Embedding
        │                     │
        └──────────┬──────────┘
                   ▼
          ┌─────────────────┐
          │  Similarity     │  Search ChromaDB
          │    Search       │
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │   Re-ranker     │  Re-rank top chunks
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │  Build Prompt   │  Context + Question
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │  Call OpenAI    │  Generate answer
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │   Response      │  Return answer to user
          └─────────────────┘
```

## API Endpoints

| Method | Endpoint         | Description                  | Auth Required |
|--------|------------------|------------------------------|---------------|
| GET    | `/health`        | Health check                 | No            |
| POST   | `/api/chat`      | Ask a question (RAG)         | Yes           |
| POST   | `/api/upload`    | Upload a document            | Yes           |
| GET    | `/api/documents` | List all uploaded documents  | Yes           |

## Future Improvements

- Async background job queue (Bull / RabbitMQ) for large document ingestion
- Multi-tenant support with isolated collections per user
- Webhook notifications when ingestion completes
- Streaming responses from OpenAI (SSE)
- Caching frequent queries via Redis
- Frontend dashboard (React / Next.js)
- PGVector / Qdrant support as alternative vector stores
- LLM guardrails and content moderation
- Rate limiting per user tier
- Full-text search fallback (MongoDB Atlas Search)
