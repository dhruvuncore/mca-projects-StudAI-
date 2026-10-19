import path from 'path';

export const config = {
  // Port & Host
  PORT: 3000,
  HOST: '0.0.0.0',

  // Upload limits
  MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024, // 25 MB
  ALLOWED_EXTENSIONS: ['.pdf', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp', '.doc', '.docx'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream', // some browsers send pdf, doc, or raw files as octet-stream
  ],

  // Storage directories
  DATA_DIR: path.resolve(process.cwd(), 'data'),
  STORAGE_DIR: path.resolve(process.cwd(), 'data', 'storage'),
  VECTOR_DB_DIR: path.resolve(process.cwd(), 'data', 'vectordb'),
  DB_DIR: path.resolve(process.cwd(), 'data', 'db'),

  // RAG Chunking configuration (Configurable as per requirement #12, #14, #44)
  CHUNK_SIZE_TOKENS: 650, // 500-800 tokens
  CHUNK_OVERLAP_TOKENS: 120, // 15-20% overlap
  MIN_CHUNK_CHAR_LENGTH: 30,

  // Retrieval configuration - Deep coverage for handwritten notes & textbooks
  TOP_K: 5,
  SIMILARITY_THRESHOLD: 0.30, // Optimized to prevent dropping relevant handwritten notes
  MAX_CONTEXT_TOKENS: 3500,

  // Embedding & LLM
  DEFAULT_EMBEDDING_DIM: 128,
  LLM_MODEL: 'gemini-3.8-flash',
};
