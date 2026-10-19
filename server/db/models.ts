export type DocumentStatus =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'EXTRACTING'
  | 'OCR'
  | 'CLEANING'
  | 'CHUNKING'
  | 'EMBEDDING'
  | 'INDEXING'
  | 'COMPLETED'
  | 'FAILED';

export interface DocumentMetrics {
  fileSize: number;
  pageCount: number;
  extractionDurationMs: number;
  ocrPagesCount: number;
  extractedChars: number;
  chunkCount: number;
  skippedChunks: number;
  embeddingCount: number;
  indexingDurationMs: number;
  totalDurationMs: number;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  notebookId: string;
  originalFileName: string;
  storageFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  uploadDate: string;
  status: DocumentStatus;
  currentStage: string;
  progress: number; // 0 to 100
  message: string;
  processedPages: number;
  totalPages: number;
  chunkCount: number;
  error: string | null;
  metrics?: DocumentMetrics;
}

export interface ExtractedPage {
  pageNumber: number;
  rawText: string;
  charCount: number;
  extractionMethod: 'text' | 'ocr';
}

export interface CleanedPage {
  pageNumber: number;
  cleanedText: string;
  extractionMethod: 'text' | 'ocr';
  headings: string[];
}

export interface DocumentChunk {
  id: string; // Deterministic: doc_xxx_chk_0001
  documentId: string;
  userId: string;
  notebookId: string;
  chunkIndex: number;
  pageStart: number;
  pageEnd: number;
  section: string;
  heading: string;
  text: string;
  tokenEstimate: number;
  extractionMethod: 'text' | 'ocr';
  sourceDocName: string;
}

export interface VectorEntry {
  id: string;
  documentId: string;
  userId: string;
  notebookId: string;
  vector: number[];
  text: string;
  metadata: {
    pageStart: number;
    pageEnd: number;
    section: string;
    heading: string;
    extractionMethod: 'text' | 'ocr';
    sourceDocName: string;
  };
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
}

export interface GroundedCitation {
  docName: string;
  pageStart: number;
  pageEnd: number;
  section: string;
  snippet: string;
  score: number;
}

export interface RAGAnswerResponse {
  answer: string;
  isGrounded: boolean;
  sources: GroundedCitation[];
  retrievalScore: number;
  documentId?: string;
  insufficientInfo?: boolean;
}
