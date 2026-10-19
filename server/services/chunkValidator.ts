import { config } from '../config';
import { DocumentChunk } from '../db/models';

export interface ChunkValidationResult {
  validChunks: DocumentChunk[];
  skippedChunksCount: number;
  reasons: { chunkId: string; reason: string }[];
}

export class ChunkValidator {
  validateChunks(chunks: DocumentChunk[]): ChunkValidationResult {
    const validChunks: DocumentChunk[] = [];
    const reasons: { chunkId: string; reason: string }[] = [];
    const seenHashes = new Set<string>();

    for (const chunk of chunks) {
      const text = chunk.text.trim();

      // 1. Check if empty or whitespace only
      if (!text) {
        reasons.push({ chunkId: chunk.id, reason: 'Empty chunk text' });
        continue;
      }

      // 2. Check if extremely short
      if (text.length < config.MIN_CHUNK_CHAR_LENGTH) {
        reasons.push({
          chunkId: chunk.id,
          reason: `Chunk length ${text.length} is below threshold ${config.MIN_CHUNK_CHAR_LENGTH}`,
        });
        continue;
      }

      // 3. Check for pure non-alphanumeric noise
      const alphanumericChars = text.replace(/[^a-zA-Z0-9]/g, '');
      if (alphanumericChars.length < 15) {
        reasons.push({ chunkId: chunk.id, reason: 'Chunk contains insufficient alphanumeric characters' });
        continue;
      }

      // 4. Check for duplicate content using normalized hash
      const simpleHash = text.slice(0, 150).toLowerCase().replace(/\s+/g, ' ');
      if (seenHashes.has(simpleHash)) {
        reasons.push({ chunkId: chunk.id, reason: 'Duplicate chunk content detected' });
        continue;
      }

      seenHashes.add(simpleHash);
      validChunks.push(chunk);
    }

    return {
      validChunks,
      skippedChunksCount: reasons.length,
      reasons,
    };
  }
}

export const chunkValidator = new ChunkValidator();
