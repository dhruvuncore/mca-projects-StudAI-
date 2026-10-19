import express, { Request, Response } from 'express';
import { ragService } from '../services/ragService';
import { vectorStore } from '../services/vectorStore';
import { db } from '../db/database';

export const chatRouter = express.Router();

/**
 * POST /api/chat
 * Grounded RAG Question Answering Endpoint
 * Requirement #1, #23-#32:
 * Question -> Validation -> Query Embedding -> Vector Retrieval -> Filtering ->
 * Top-K Selection -> Context Construction -> Grounded Generation -> Sources Attachment
 */
chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { query, userId = 'student_demo', notebookId, documentId, history } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required and cannot be blank.' });
    }

    const response = await ragService.answerQuestion({
      query: query.trim(),
      userId,
      notebookId,
      documentId,
      history: Array.isArray(history) ? history : undefined,
    });

    return res.json({
      success: true,
      answer: response.answer,
      isGrounded: response.isGrounded,
      sources: response.sources,
      retrievalScore: response.retrievalScore,
      documentId: response.documentId,
      insufficientInfo: response.insufficientInfo || false,
    });
  } catch (err: any) {
    console.error('Chat RAG endpoint error:', err);
    return res.status(500).json({
      error: err?.message || 'An error occurred while answering your question with RAG.',
    });
  }
});

/**
 * GET /api/chat/stats
 * Provides overview of the knowledge base index
 */
chatRouter.get('/stats', (req: Request, res: Response) => {
  const totalVectors = vectorStore.getEntryCount();
  const allDocs = db.getAllDocuments();
  const completedDocs = allDocs.filter((d) => d.status === 'COMPLETED');

  return res.json({
    totalVectors,
    totalDocuments: allDocs.length,
    completedDocuments: completedDocs.length,
    indexedPages: completedDocs.reduce((acc, d) => acc + (d.totalPages || 0), 0),
  });
});
