import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config';
import { documentsRouter } from './server/api/documentsRoutes';
import { chatRouter } from './server/api/chatRoutes';
import { db } from './server/db/database';
import { documentProcessor } from './server/queue/documentProcessor';

async function startServer() {
  const app = express();
  const PORT = config.PORT;

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AI Student Learning & Exam Assistant - RAG Pipeline',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/documents', documentsRouter);
  app.use('/api/chat', chatRouter);

  // Fallback for unmatched /api/* routes - guarantees API requests never return HTML from Vite SPA
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `API route ${req.method} ${req.path} not found`,
    });
  });

  // Global error handler for API requests - always respond with JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Server error:', err);
    res.status(err.status || err.statusCode || 500).json({
      error: err.message || 'Internal server error processing document request',
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, config.HOST, () => {
    console.log(`AI Student RAG Server running on http://${config.HOST}:${PORT}`);
  });
}

startServer();

