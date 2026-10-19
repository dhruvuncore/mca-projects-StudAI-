import { config } from '../config';
import { CleanedPage, DocumentChunk } from '../db/models';
import { structureDetector } from './structureDetector';

export class Chunker {
  /**
   * Structure-aware semantic chunking.
   * Chunks pages while preserving section hierarchies, definitions,
   * and page ranges with configurable overlap.
   */
  chunkPages(
    documentId: string,
    userId: string,
    notebookId: string,
    sourceDocName: string,
    pages: CleanedPage[]
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const maxChars = config.CHUNK_SIZE_TOKENS * 4; // Approx 4 chars per token
    const overlapChars = config.CHUNK_OVERLAP_TOKENS * 4;

    let currentSection = 'Introduction / Overview';
    let currentHeading = '';
    let currentBuffer = '';
    let startPage = 1;
    let endPage = 1;
    let currentMethod: 'text' | 'ocr' = 'text';
    let chunkIndex = 1;

    for (const page of pages) {
      const pageText = page.cleanedText;
      if (!pageText.trim()) continue;

      if (page.extractionMethod === 'ocr') {
        currentMethod = 'ocr';
      }

      const paragraphs = pageText.split(/\n{2,}/);

      for (const para of paragraphs) {
        const trimmedPara = para.trim();
        if (!trimmedPara) continue;

        // Check if paragraph starts with a structural element
        const firstLine = trimmedPara.split('\n')[0];
        const struct = structureDetector.detectLineStructure(firstLine);

        if (struct.type === 'section') {
          currentSection = struct.title;
          currentHeading = struct.title;
        } else if (struct.type === 'heading' || struct.type === 'definition') {
          currentHeading = struct.title;
        }

        // If currentBuffer + paragraph exceeds maxChars and currentBuffer has enough text, flush chunk
        if (currentBuffer.length + trimmedPara.length > maxChars && currentBuffer.length >= config.MIN_CHUNK_CHAR_LENGTH * 3) {
          const chunkId = `${documentId}_chk_${chunkIndex.toString().padStart(4, '0')}`;
          
          chunks.push({
            id: chunkId,
            documentId,
            userId,
            notebookId,
            chunkIndex,
            pageStart: startPage,
            pageEnd: endPage,
            section: currentSection,
            heading: currentHeading || currentSection,
            text: currentBuffer.trim(),
            tokenEstimate: Math.ceil(currentBuffer.length / 4),
            extractionMethod: currentMethod,
            sourceDocName,
          });

          chunkIndex++;

          // Create overlap from the end of the previous buffer
          const overlapText = currentBuffer.slice(-overlapChars);
          currentBuffer = overlapText + '\n\n' + trimmedPara;
          startPage = endPage; // Start page stays at current boundary
          currentMethod = page.extractionMethod;
        } else {
          if (currentBuffer.length === 0) {
            startPage = page.pageNumber;
            currentMethod = page.extractionMethod;
          }
          currentBuffer += (currentBuffer.length > 0 ? '\n\n' : '') + trimmedPara;
          endPage = page.pageNumber;
        }
      }
    }

    // Flush remaining buffer
    if (currentBuffer.trim().length >= config.MIN_CHUNK_CHAR_LENGTH) {
      const chunkId = `${documentId}_chk_${chunkIndex.toString().padStart(4, '0')}`;
      chunks.push({
        id: chunkId,
        documentId,
        userId,
        notebookId,
        chunkIndex,
        pageStart: startPage,
        pageEnd: endPage,
        section: currentSection,
        heading: currentHeading || currentSection,
        text: currentBuffer.trim(),
        tokenEstimate: Math.ceil(currentBuffer.length / 4),
        extractionMethod: currentMethod,
        sourceDocName,
      });
    }

    return chunks;
  }
}

export const chunker = new Chunker();
