import { RetrievalResult } from '../db/models';
import { config } from '../config';

export interface ConstructedContext {
  contextString: string;
  sourcesList: {
    docName: string;
    pageStart: number;
    pageEnd: number;
    section: string;
    heading: string;
    snippet: string;
    score: number;
  }[];
  totalTokensEstimate: number;
}

export class ContextBuilder {
  buildContext(retrieved: RetrievalResult[]): ConstructedContext {
    let accumulatedTokens = 0;
    const sourcesList: ConstructedContext['sourcesList'] = [];
    const contextBlocks: string[] = [];

    retrieved.forEach((item, idx) => {
      const chunk = item.chunk;
      const snippet = chunk.text.slice(0, 160) + (chunk.text.length > 160 ? '...' : '');

      sourcesList.push({
        docName: chunk.sourceDocName,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        section: chunk.section,
        heading: chunk.heading,
        snippet,
        score: item.score,
      });

      // Context block formatted cleanly with source attribution
      const pageInfo = chunk.pageStart === chunk.pageEnd ? `Page ${chunk.pageStart}` : `Pages ${chunk.pageStart}–${chunk.pageEnd}`;
      const block =
        `[SOURCE ${idx + 1} | Document: ${chunk.sourceDocName} | ${pageInfo} | Section: ${chunk.section} | Heading: ${chunk.heading}]\n` +
        `${chunk.text.trim()}`;

      const blockTokens = Math.ceil(block.length / 4);

      if (accumulatedTokens + blockTokens <= config.MAX_CONTEXT_TOKENS) {
        contextBlocks.push(block);
        accumulatedTokens += blockTokens;
      }
    });

    return {
      contextString: contextBlocks.join('\n\n---\n\n'),
      sourcesList,
      totalTokensEstimate: accumulatedTokens,
    };
  }
}

export const contextBuilder = new ContextBuilder();
