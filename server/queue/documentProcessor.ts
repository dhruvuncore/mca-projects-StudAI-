import { db } from '../db/database';
import { DocumentMetrics } from '../db/models';
import { pdfExtractor } from '../services/pdfExtractor';
import { textCleaner } from '../services/textCleaner';
import { structureDetector } from '../services/structureDetector';
import { chunker } from '../services/chunker';
import { chunkValidator } from '../services/chunkValidator';
import { embeddingService } from '../services/embeddingService';
import { vectorStore } from '../services/vectorStore';

export class DocumentProcessor {
  /**
   * Asynchronous background ingestion pipeline.
   * Requirement #1, #4, #19, #20, #43:
   * Non-blocking background worker that progresses through all pipeline stages,
   * updates the database with live metrics, and handles errors safely.
   */
  async processDocument(documentId: string): Promise<void> {
    const startTime = Date.now();

    const doc = db.getDocument(documentId);
    if (!doc) {
      console.error(`Document ${documentId} not found in database.`);
      return;
    }

    try {
      // 1. Stage: PROCESSING
      db.updateDocument(documentId, {
        status: 'PROCESSING',
        currentStage: 'Initializing ingestion pipeline',
        progress: 25,
        message: 'Validating file integrity and preparing background worker...',
      });

      // Small async delay so UI observes genuine stage transition
      await new Promise((r) => setTimeout(r, 400));

      // 2. Stage: EXTRACTING (Page-by-page extraction)
      const extractStart = Date.now();
      db.updateDocument(documentId, {
        status: 'EXTRACTING',
        currentStage: 'Page-by-page text extraction',
        progress: 35,
        message: 'Parsing document structure and extracting text per page...',
      });

      const extractedPages = await pdfExtractor.extractPages(doc.storagePath, doc.originalFileName);
      const extractDuration = Date.now() - extractStart;
      const totalPages = extractedPages.length || 1;
      const ocrPages = extractedPages.filter((p) => p.extractionMethod === 'ocr');

      let totalExtractedChars = 0;
      extractedPages.forEach((p) => {
        totalExtractedChars += p.charCount;
      });

      // 3. Stage: OCR (if any page needed OCR)
      if (ocrPages.length > 0) {
        db.updateDocument(documentId, {
          status: 'OCR',
          currentStage: `Optical Character Recognition (${ocrPages.length} scanned pages)`,
          progress: 50,
          message: `Applying OCR fallback to ${ocrPages.length} scanned or low-density pages...`,
          processedPages: totalPages,
          totalPages,
        });
        await new Promise((r) => setTimeout(r, 450));
      }

      // 4. Stage: CLEANING
      db.updateDocument(documentId, {
        status: 'CLEANING',
        currentStage: 'Text normalization & artifact removal',
        progress: 60,
        message: 'Removing repeated headers/footers while preserving formulas and definitions...',
        processedPages: totalPages,
        totalPages,
      });

      const cleanedPages = extractedPages.map((page) => {
        const cleaned = textCleaner.cleanPageText(page.rawText, page.pageNumber);
        const headings = structureDetector.extractPageHeadings(cleaned);
        return {
          pageNumber: page.pageNumber,
          cleanedText: cleaned,
          extractionMethod: page.extractionMethod,
          headings,
        };
      });

      await new Promise((r) => setTimeout(r, 350));

      // 5. Stage: CHUNKING
      db.updateDocument(documentId, {
        status: 'CHUNKING',
        currentStage: 'Structure-aware semantic chunking',
        progress: 72,
        message: 'Dividing content into semantic chunks (500-800 tokens) with 15% overlap...',
      });

      const rawChunks = chunker.chunkPages(
        doc.id,
        doc.userId,
        doc.notebookId,
        doc.originalFileName,
        cleanedPages
      );

      // Validate chunks
      const validation = chunkValidator.validateChunks(rawChunks);
      const validChunks = validation.validChunks;

      if (validChunks.length === 0) {
        throw new Error('Document processing yielded zero valid text chunks. The document may be empty or unreadable.');
      }

      // Save relational chunks to DB
      db.saveDocumentChunks(documentId, validChunks);

      db.updateDocument(documentId, {
        chunkCount: validChunks.length,
      });

      await new Promise((r) => setTimeout(r, 350));

      // 6. Stage: EMBEDDING
      db.updateDocument(documentId, {
        status: 'EMBEDDING',
        currentStage: `Generating vector embeddings (${validChunks.length} chunks)`,
        progress: 85,
        message: `Computing 128-dimensional dense semantic embeddings for ${validChunks.length} chunks...`,
      });

      const chunkTexts = validChunks.map((c) => c.text);
      const vectors = await embeddingService.embedChunks(chunkTexts);

      await new Promise((r) => setTimeout(r, 350));

      // 7. Stage: INDEXING (ChromaDB / Local Vector Store)
      const indexStart = Date.now();
      db.updateDocument(documentId, {
        status: 'INDEXING',
        currentStage: 'Vector database indexing',
        progress: 94,
        message: 'Upserting chunk embeddings and metadata into persistent vector database...',
      });

      // Clear existing vectors for this doc first (Idempotency requirement #21)
      vectorStore.deleteByDocumentId(documentId);

      // Upsert chunks and vectors
      await vectorStore.upsertChunks(validChunks, vectors);
      const indexingDuration = Date.now() - indexStart;

      const totalDuration = Date.now() - startTime;

      // 8. Stage: COMPLETED
      const metrics: DocumentMetrics = {
        fileSize: doc.fileSize,
        pageCount: totalPages,
        extractionDurationMs: extractDuration,
        ocrPagesCount: ocrPages.length,
        extractedChars: totalExtractedChars,
        chunkCount: validChunks.length,
        skippedChunks: validation.skippedChunksCount,
        embeddingCount: vectors.length,
        indexingDurationMs: indexingDuration,
        totalDurationMs: totalDuration,
      };

      db.updateDocument(documentId, {
        status: 'COMPLETED',
        currentStage: 'Document Ingestion Complete',
        progress: 100,
        message: `Successfully indexed ${validChunks.length} chunks across ${totalPages} pages into knowledge base.`,
        processedPages: totalPages,
        totalPages,
        chunkCount: validChunks.length,
        error: null,
        metrics,
      });

      console.log(
        `[Pipeline Complete] Document "${doc.originalFileName}" (${documentId}): ${totalPages} pages, ${validChunks.length} chunks, duration: ${totalDuration}ms`
      );
    } catch (err: any) {
      console.error(`Document ${documentId} ingestion failed:`, err);
      // Requirement #20: Processing Failure handling
      db.updateDocument(documentId, {
        status: 'FAILED',
        currentStage: 'Processing Failed',
        message: 'Ingestion pipeline encountered an error.',
        error: err?.message || 'Unknown processing error occurred while extracting document.',
      });
    }
  }
}

export const documentProcessor = new DocumentProcessor();
