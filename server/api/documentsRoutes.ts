import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { db } from '../db/database';
import { documentProcessor } from '../queue/documentProcessor';
import { vectorStore } from '../services/vectorStore';
import { DocumentRecord } from '../db/models';

export const documentsRouter = express.Router();

// Configure Multer Storage for Original Files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(config.STORAGE_DIR)) {
      fs.mkdirSync(config.STORAGE_DIR, { recursive: true });
    }
    cb(null, config.STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    // Clean safe filename (Requirement #38 Security)
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
    cb(null, `doc_${uniqueSuffix}_${safeBaseName}${ext}`);
  },
});

// File validation filter (Requirement #5)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtensionValid = config.ALLOWED_EXTENSIONS.includes(ext);
  const isMimeValid =
    config.ALLOWED_MIME_TYPES.includes(file.mimetype) ||
    file.mimetype === 'application/pdf' ||
    file.mimetype.startsWith('text/') ||
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/msword' ||
    file.mimetype.includes('wordprocessingml');

  if (!isExtensionValid && !isMimeValid) {
    return cb(
      new Error(
        `Unsupported document type. Supported formats: PDF, Word Documents (.doc, .docx), Images (PNG, JPG, WEBP), and Text files (${config.ALLOWED_EXTENSIONS.join(', ')}).`
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: config.MAX_FILE_SIZE_BYTES },
  fileFilter,
});

/**
 * POST /api/documents/upload
 * Requirement #4: Dedicated upload endpoint.
 * Validates, stores original file, creates DB record, starts async background task,
 * and immediately returns document ID and status without blocking.
 */
documentsRouter.post('/upload', (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      console.warn('Multer upload error:', err.message);
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File exceeds the 25 MB limit.'
          : err.message || 'File upload failed validation.';
      return res.status(400).json({ error: msg });
    }

    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No document file provided for upload.' });
      }

      const userId = (req.body.userId as string) || 'student_demo';
      const notebookId = (req.body.notebookId as string) || 'nb_dbms';

      const documentId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const newDoc: DocumentRecord = {
        id: documentId,
        userId,
        notebookId,
        originalFileName: file.originalname,
        storageFileName: file.filename,
        storagePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        status: 'UPLOADED',
        currentStage: 'Document uploaded and queued',
        progress: 20,
        message: 'Upload complete. Launching asynchronous ingestion pipeline...',
        processedPages: 0,
        totalPages: 1,
        chunkCount: 0,
        error: null,
      };

      // Save initial record to database
      db.createDocument(newDoc);

      // Launch processing in the background asynchronously (non-blocking!)
      setImmediate(() => {
        documentProcessor.processDocument(documentId).catch((procErr) => {
          console.error(`Background ingestion error for ${documentId}:`, procErr);
        });
      });

      // Return 202 Accepted immediately
      return res.status(202).json({
        success: true,
        documentId,
        status: 'UPLOADED',
        message: 'Document uploaded successfully. Processing pipeline started in background.',
        document: newDoc,
      });
    } catch (err: any) {
      console.error('Upload route error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to process document upload.',
      });
    }
  });
});

/**
 * GET /api/documents
 * Lists documents for a user or notebook
 */
documentsRouter.get('/', (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const notebookId = req.query.notebookId as string | undefined;

  const docs = db.getAllDocuments(userId, notebookId);
  return res.json({ documents: docs, total: docs.length });
});

/**
 * GET /api/documents/:id/status
 * Requirement #19: Exposes document processing status and live metrics.
 */
documentsRouter.get('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.getDocument(id);

  if (!doc) {
    return res.status(404).json({ error: `Document with ID "${id}" not found.` });
  }

  return res.json({
    document_id: doc.id,
    status: doc.status,
    progress: doc.progress,
    current_stage: doc.currentStage,
    message: doc.message,
    processed_pages: doc.processedPages,
    total_pages: doc.totalPages,
    chunk_count: doc.chunkCount,
    metrics: doc.metrics || null,
    error: doc.error,
  });
});

/**
 * GET /api/documents/:id
 * Detailed document metadata
 */
documentsRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.getDocument(id);

  if (!doc) {
    return res.status(404).json({ error: `Document with ID "${id}" not found.` });
  }

  return res.json({ document: doc });
});

/**
 * GET /api/documents/:id/chunks
 * Inspect chunks generated for this document
 */
documentsRouter.get('/:id/chunks', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.getDocument(id);

  if (!doc) {
    return res.status(404).json({ error: `Document with ID "${id}" not found.` });
  }

  const chunks = db.getDocumentChunks(id);
  return res.json({
    documentId: id,
    totalChunks: chunks.length,
    chunks,
  });
});

/**
 * DELETE /api/documents/notebooks/:notebookId
 * Removes all documents, database records, and vector embeddings for a deleted notebook.
 */
documentsRouter.delete('/notebooks/:notebookId', (req: Request, res: Response) => {
  const { notebookId } = req.params;
  const docs = db.getAllDocuments(undefined, notebookId);
  let totalVectors = 0;

  for (const doc of docs) {
    totalVectors += vectorStore.deleteByDocumentId(doc.id);
    db.deleteDocument(doc.id);
  }

  return res.json({
    success: true,
    message: `Removed ${docs.length} documents and ${totalVectors} vector chunks for notebook "${notebookId}".`,
    deletedDocumentsCount: docs.length,
    deletedVectors: totalVectors,
  });
});

/**
 * DELETE /api/documents/:id
 * Requirement #22: Removes file, database record, and associated vector entries.
 */
documentsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.getDocument(id);

  if (!doc) {
    return res.status(404).json({ error: `Document with ID "${id}" not found.` });
  }

  // Delete vectors from vector store
  const deletedVectors = vectorStore.deleteByDocumentId(id);

  // Delete from relational DB and disk
  const deletedFromDb = db.deleteDocument(id);

  return res.json({
    success: true,
    message: `Document "${doc.originalFileName}" and its ${deletedVectors} vector chunks were permanently removed.`,
    deletedVectors,
  });
});

/**
 * POST /api/documents/:id/retry
 * Requirement #20: Retry processing for a failed document
 */
documentsRouter.post('/:id/retry', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.getDocument(id);

  if (!doc) {
    return res.status(404).json({ error: `Document with ID "${id}" not found.` });
  }

  setImmediate(() => {
    documentProcessor.processDocument(id).catch((err) => {
      console.error(`Retry failed for ${id}:`, err);
    });
  });

  return res.json({
    success: true,
    message: `Retry initiated for document "${doc.originalFileName}".`,
    documentId: id,
  });
});

/**
 * POST /api/documents/clear-all
 * Clears all uploaded documents, vectors, and database records.
 */
documentsRouter.post('/clear-all', (req: Request, res: Response) => {
  try {
    db.clearAll();
    vectorStore.clearAll();

    // Clean out storage directory
    if (fs.existsSync(config.STORAGE_DIR)) {
      const files = fs.readdirSync(config.STORAGE_DIR);
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(config.STORAGE_DIR, file));
        } catch {
          // ignore
        }
      }
    }

    return res.json({
      success: true,
      message: 'All documents, database records, and vector indices have been completely cleared.',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: `Failed to clear data: ${err?.message || err}`,
    });
  }
});

