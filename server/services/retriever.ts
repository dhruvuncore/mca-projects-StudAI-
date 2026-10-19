import { db } from '../db/database';
import { RetrievalResult } from '../db/models';
import { embeddingService } from './embeddingService';
import { vectorStore, SearchOptions } from './vectorStore';

export class Retriever {
  async retrieveRelevantChunks(query: string, options: SearchOptions): Promise<RetrievalResult[]> {
    if (!query || !query.trim()) {
      return [];
    }

    // 1. If documentId is passed, verify document exists and is COMPLETED (Requirement #23)
    if (options.documentId) {
      const doc = db.getDocument(options.documentId);
      if (!doc) {
        throw new Error(`Document with ID "${options.documentId}" does not exist.`);
      }
      if (doc.status !== 'COMPLETED') {
        throw new Error(
          `Document is currently in status "${doc.status}". Retrieval is only allowed once processing is COMPLETED.`
        );
      }
    }

    // 2. Query Embedding (Requirement #24)
    const queryVector = await embeddingService.embedQuery(query.trim());

    // 3. Hybrid similarity search with user & document scoping (Requirement #25, #38, #39)
    const results = vectorStore.similaritySearch(queryVector, {
      ...options,
      queryText: query.trim(),
    });

    return results;
  }
}

export const retriever = new Retriever();
