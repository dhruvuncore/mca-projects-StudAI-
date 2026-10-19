import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { VectorEntry, DocumentChunk, RetrievalResult } from '../db/models';

export interface SearchOptions {
  userId: string;
  documentId?: string;
  notebookId?: string;
  queryText?: string;
  topK?: number;
  threshold?: number;
}

export class VectorStore {
  private storeFile: string;
  private entries: Map<string, VectorEntry> = new Map();

  constructor() {
    this.storeFile = path.join(config.VECTOR_DB_DIR, 'vectors.json');
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(config.VECTOR_DB_DIR)) {
        fs.mkdirSync(config.VECTOR_DB_DIR, { recursive: true });
      }
      if (fs.existsSync(this.storeFile)) {
        const data = fs.readFileSync(this.storeFile, 'utf-8');
        const list: VectorEntry[] = JSON.parse(data);
        list.forEach((entry) => this.entries.set(entry.id, entry));
      }
    } catch (err) {
      console.error('Failed to init VectorStore:', err);
    }
  }

  private save() {
    try {
      const list = Array.from(this.entries.values());
      fs.writeFileSync(this.storeFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist VectorStore to disk:', err);
    }
  }

  /**
   * Idempotently upsert chunks with their embeddings.
   * Requirement #21: Stable chunk IDs prevent duplicate vector creation on retry.
   */
  async upsertChunks(chunks: DocumentChunk[], vectors: number[][]): Promise<void> {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vector = vectors[i];

      const entry: VectorEntry = {
        id: chunk.id,
        documentId: chunk.documentId,
        userId: chunk.userId,
        notebookId: chunk.notebookId,
        vector,
        text: chunk.text,
        metadata: {
          pageStart: chunk.pageStart,
          pageEnd: chunk.pageEnd,
          section: chunk.section,
          heading: chunk.heading,
          extractionMethod: chunk.extractionMethod,
          sourceDocName: chunk.sourceDocName,
        },
      };

      this.entries.set(entry.id, entry);
    }

    this.save();
  }

  /**
   * Complete vector cleanup when a document is deleted or reprocessed.
   * Requirement #22: Remove associated vector database entries; leave no orphaned vectors.
   */
  deleteByDocumentId(documentId: string): number {
    let deletedCount = 0;
    const toDelete: string[] = [];

    this.entries.forEach((entry, id) => {
      if (entry.documentId === documentId) {
        toDelete.push(id);
      }
    });

    toDelete.forEach((id) => {
      this.entries.delete(id);
      deletedCount++;
    });

    if (deletedCount > 0) {
      this.save();
    }

    return deletedCount;
  }

  /**
   * Clears all vector entries.
   */
  clearAll(): void {
    this.entries.clear();
    this.save();
  }

  /**
   * Hybrid similarity search combining dense vector cosine similarity (65%)
   * and lexical keyword overlap (35%) with section & heading boosting.
   * Ensures accurate retrieval for handwritten notes, textbooks, and technical terms.
   */
  similaritySearch(queryVector: number[], options: SearchOptions): RetrievalResult[] {
    const {
      userId,
      documentId,
      notebookId,
      queryText = '',
      topK = config.TOP_K,
      threshold = config.SIMILARITY_THRESHOLD,
    } = options;

    const candidates: { entry: VectorEntry; score: number }[] = [];

    // Pre-process query keywords for lexical scoring
    const stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'which', 'who', 'how', 'why',
      'when', 'where', 'can', 'you', 'give', 'me', 'tell', 'about', 'and', 'or', 'in', 'on',
      'at', 'to', 'for', 'of', 'with', 'by', 'from', 'explain', 'describe', 'define'
    ]);
    const queryTokens = (queryText.toLowerCase().match(/[a-z0-9_#$+-]+/g) || []).filter(
      (w) => w.length > 1 && !stopWords.has(w)
    );

    this.entries.forEach((entry) => {
      // Access control & Scoping (Requirement #38 & #39)
      if (userId && entry.userId !== userId) {
        return;
      }
      if (documentId && entry.documentId !== documentId) {
        return;
      }
      if (notebookId && entry.notebookId !== notebookId) {
        return;
      }

      // 1. Calculate dense vector cosine similarity via dot product
      let dotProduct = 0;
      const v = entry.vector;
      const len = Math.min(queryVector.length, v.length);
      for (let i = 0; i < len; i++) {
        dotProduct += queryVector[i] * v[i];
      }
      const semanticScore = Math.max(0, Math.min(1, (dotProduct + 1) / 2));

      // 2. Calculate lexical keyword matching score (BM25-style overlap)
      let lexicalScore = 0;
      if (queryTokens.length > 0) {
        const textLower = (entry.text || '').toLowerCase();
        const headingLower = (entry.metadata.heading || '').toLowerCase();
        const sectionLower = (entry.metadata.section || '').toLowerCase();

        let matchedTokens = 0;
        let headingBonus = 0;

        for (const token of queryTokens) {
          if (textLower.includes(token)) {
            matchedTokens++;
          }
          if (headingLower.includes(token) || sectionLower.includes(token)) {
            headingBonus += 0.2;
          }
        }

        const tokenOverlapRatio = matchedTokens / queryTokens.length;
        lexicalScore = Math.min(1, tokenOverlapRatio + Math.min(0.3, headingBonus));

        // Exact phrase bonus if query is 2+ words
        if (queryText.length > 4 && textLower.includes(queryText.toLowerCase())) {
          lexicalScore = Math.min(1, lexicalScore + 0.25);
        }
      }

      // 3. Hybrid fusion: 65% dense semantic + 35% lexical keyword matching
      const finalScore = queryTokens.length > 0
        ? 0.65 * semanticScore + 0.35 * lexicalScore
        : semanticScore;

      candidates.push({ entry, score: finalScore });
    });

    // Rank descending by similarity score
    candidates.sort((a, b) => b.score - a.score);

    // Filter by similarity threshold
    const filtered = candidates.filter((c) => c.score >= threshold);

    // Take top-K results
    const topResults = (filtered.length > 0 ? filtered : candidates.slice(0, 1)).slice(0, topK);

    return topResults.map((c) => ({
      chunk: {
        id: c.entry.id,
        documentId: c.entry.documentId,
        userId: c.entry.userId,
        notebookId: c.entry.notebookId,
        chunkIndex: 0,
        pageStart: c.entry.metadata.pageStart,
        pageEnd: c.entry.metadata.pageEnd,
        section: c.entry.metadata.section,
        heading: c.entry.metadata.heading,
        text: c.entry.text,
        tokenEstimate: Math.ceil(c.entry.text.length / 4),
        extractionMethod: c.entry.metadata.extractionMethod,
        sourceDocName: c.entry.metadata.sourceDocName,
      },
      score: Math.round(c.score * 100) / 100,
    }));
  }

  getEntryCount(): number {
    return this.entries.size;
  }
}

export const vectorStore = new VectorStore();
