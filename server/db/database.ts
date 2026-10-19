import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { DocumentRecord, DocumentChunk } from './models';

class Database {
  private docsFile: string;
  private chunksFile: string;
  private documents: Map<string, DocumentRecord> = new Map();
  private chunks: Map<string, DocumentChunk[]> = new Map(); // docId -> DocumentChunk[]

  constructor() {
    this.docsFile = path.join(config.DB_DIR, 'documents.json');
    this.chunksFile = path.join(config.DB_DIR, 'chunks.json');
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(config.DATA_DIR)) fs.mkdirSync(config.DATA_DIR, { recursive: true });
      if (!fs.existsSync(config.STORAGE_DIR)) fs.mkdirSync(config.STORAGE_DIR, { recursive: true });
      if (!fs.existsSync(config.VECTOR_DB_DIR)) fs.mkdirSync(config.VECTOR_DB_DIR, { recursive: true });
      if (!fs.existsSync(config.DB_DIR)) fs.mkdirSync(config.DB_DIR, { recursive: true });

      if (fs.existsSync(this.docsFile)) {
        const raw = fs.readFileSync(this.docsFile, 'utf-8');
        const list: DocumentRecord[] = JSON.parse(raw);
        list.forEach((doc) => this.documents.set(doc.id, doc));
      }

      if (fs.existsSync(this.chunksFile)) {
        const raw = fs.readFileSync(this.chunksFile, 'utf-8');
        const map: Record<string, DocumentChunk[]> = JSON.parse(raw);
        Object.entries(map).forEach(([docId, chks]) => this.chunks.set(docId, chks));
      }
    } catch (err) {
      console.error('Database init error:', err);
    }
  }

  private saveDocuments() {
    try {
      const list = Array.from(this.documents.values());
      fs.writeFileSync(this.docsFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save documents to disk:', err);
    }
  }

  private saveChunks() {
    try {
      const obj: Record<string, DocumentChunk[]> = {};
      this.chunks.forEach((val, key) => {
        obj[key] = val;
      });
      fs.writeFileSync(this.chunksFile, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save chunks to disk:', err);
    }
  }

  // Document operations
  createDocument(doc: DocumentRecord): DocumentRecord {
    this.documents.set(doc.id, doc);
    this.saveDocuments();
    return doc;
  }

  getDocument(id: string): DocumentRecord | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(userId?: string, notebookId?: string): DocumentRecord[] {
    let list = Array.from(this.documents.values());
    if (userId) {
      list = list.filter((d) => d.userId === userId);
    }
    if (notebookId) {
      list = list.filter((d) => d.notebookId === notebookId);
    }
    return list.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  updateDocument(id: string, updates: Partial<DocumentRecord>): DocumentRecord | undefined {
    const existing = this.documents.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.documents.set(id, updated);
    this.saveDocuments();
    return updated;
  }

  deleteDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    // Remove original file
    try {
      if (fs.existsSync(doc.storagePath)) {
        fs.unlinkSync(doc.storagePath);
      }
    } catch (e) {
      console.warn('Could not remove file on disk:', e);
    }

    this.documents.delete(id);
    this.chunks.delete(id);
    this.saveDocuments();
    this.saveChunks();
    return true;
  }

  // Chunks operations
  saveDocumentChunks(documentId: string, chunks: DocumentChunk[]) {
    this.chunks.set(documentId, chunks);
    this.saveChunks();
  }

  getDocumentChunks(documentId: string): DocumentChunk[] {
    return this.chunks.get(documentId) || [];
  }

  getAllChunksForUser(userId: string): DocumentChunk[] {
    const res: DocumentChunk[] = [];
    this.chunks.forEach((chunkList) => {
      chunkList.forEach((c) => {
        if (c.userId === userId) res.push(c);
      });
    });
    return res;
  }

  clearAll() {
    this.documents.clear();
    this.chunks.clear();
    this.saveDocuments();
    this.saveChunks();
  }
}

export const db = new Database();
