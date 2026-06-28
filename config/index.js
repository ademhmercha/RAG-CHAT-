// Central configuration loader.
// Aggregates all environment variables and sub-configs into a single export.

const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3000,

  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/rag-nodejs",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 2048,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },

  ollama: {
    host: process.env.OLLAMA_HOST || "http://ollama:11434",
    model: process.env.OLLAMA_MODEL || "llama3.2",
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
  },

  chroma: {
    host: process.env.CHROMA_HOST || "localhost",
    port: parseInt(process.env.CHROMA_PORT, 10) || 8000,
    collection: process.env.CHROMA_COLLECTION || "rag_documents",
    get url() {
      return `http://${this.host}:${this.port}`;
    },
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  upload: {
    dir: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024,
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    dir: process.env.LOG_DIR || "logs",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
};

module.exports = config;
