import { db } from '../db/database';
import { RAGAnswerResponse } from '../db/models';
import { retriever } from './retriever';
import { contextBuilder } from './contextBuilder';
import { llmService, ChatHistoryMessage } from './llmService';

export interface RAGQueryParams {
  query: string;
  userId: string;
  notebookId?: string;
  documentId?: string;
  history?: ChatHistoryMessage[];
}

export class RAGService {
  async answerQuestion(params: RAGQueryParams): Promise<RAGAnswerResponse> {
    const { query, userId, notebookId, documentId, history } = params;

    if (!query || !query.trim()) {
      throw new Error('Question query cannot be empty.');
    }

    let targetDocName: string | undefined;

    if (documentId) {
      const doc = db.getDocument(documentId);
      if (doc) {
        targetDocName = doc.originalFileName;
      }
    }

    // 1. Follow-up query contextual enrichment for retrieval
    let retrievalQuery = query.trim();
    if (history && history.length > 0) {
      const isFollowUp =
        /^(can you|give an example|why|how|what about|explain|tell me more|what does that mean|example|more details|what are)/i.test(
          query.trim()
        ) || query.trim().split(/\s+/).length <= 5;

      if (isFollowUp) {
        const lastUserTurn = [...history].reverse().find((m) => m.role === 'user');
        if (lastUserTurn && lastUserTurn.content) {
          retrievalQuery = `${lastUserTurn.content} ${query.trim()}`;
        }
      }
    }

    // 2. Vector Retrieval with Document/User Scoping
    const retrievedChunks = await retriever.retrieveRelevantChunks(retrievalQuery, {
      userId,
      documentId,
      notebookId,
    });

    // 3. Build Structured Grounded Context
    const constructedContext = contextBuilder.buildContext(retrievedChunks);

    // 4. Generate Grounded, ChatGPT-like Tutor Response
    const llmResponse = await llmService.generateGroundedAnswer({
      query: query.trim(),
      context: constructedContext,
      docName: targetDocName,
      history,
    });

    // 5. Format Clean Citations
    const sources = constructedContext.sourcesList.map((s) => ({
      docName: s.docName,
      pageStart: s.pageStart,
      pageEnd: s.pageEnd,
      section: s.section,
      snippet: s.snippet,
      score: s.score,
    }));

    const topScore = sources.length > 0 ? sources[0].score : 0;

    return {
      answer: llmResponse.answer,
      isGrounded: llmResponse.isGrounded,
      sources,
      retrievalScore: topScore,
      documentId,
      insufficientInfo: llmResponse.insufficientInfo,
    };
  }
}

export const ragService = new RAGService();
