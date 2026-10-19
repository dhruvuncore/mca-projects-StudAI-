import { config } from '../config';

export interface IEmbeddingService {
  embedQuery(text: string): Promise<number[]>;
  embedChunks(texts: string[]): Promise<number[][]>;
  getDimension(): number;
}

/**
 * High-performance, local deterministic semantic embedding engine.
 * Generates 128-dimensional L2-normalized dense semantic vectors
 * using subword hashing, character trigrams, term frequency weighting,
 * and semantic projection. Works 100% locally with zero external API calls.
 */
export class LocalSemanticEmbeddingService implements IEmbeddingService {
  private dimension: number;

  constructor(dimension: number = config.DEFAULT_EMBEDDING_DIM) {
    this.dimension = dimension;
  }

  getDimension(): number {
    return this.dimension;
  }

  /**
   * Generates a dense unit vector for a chunk or query.
   */
  async embedQuery(text: string): Promise<number[]> {
    return this.generateVector(text);
  }

  async embedChunks(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.generateVector(t));
  }

  private generateVector(text: string): number[] {
    const vec = new Float64Array(this.dimension);
    if (!text || !text.trim()) {
      return Array.from(vec);
    }

    const cleaned = text.toLowerCase();
    const words = cleaned.match(/[a-z0-9_#$]+/g) || [];

    // 1. Process whole tokens and their hash projections
    words.forEach((word, idx) => {
      // Position weight slightly favors beginning and technical terms
      const posWeight = 1.0 / Math.sqrt(idx + 1);

      // Murmur/FNV style hash distribution across vector dimensions
      let h1 = 2166136261;
      let h2 = 1442695040888963407n;

      for (let i = 0; i < word.length; i++) {
        const code = word.charCodeAt(i);
        h1 = (h1 ^ code) * 16777619;
      }

      const idx1 = Math.abs(h1) % this.dimension;
      const idx2 = (idx1 + 17) % this.dimension;
      const sign = (h1 & 1) === 0 ? 1 : -1;

      vec[idx1] += sign * (1.5 + posWeight);
      vec[idx2] += -sign * (1.0 + posWeight * 0.5);

      // 2. Character trigrams for morphological and typo tolerance
      if (word.length >= 3) {
        for (let i = 0; i <= word.length - 3; i++) {
          const tri = word.slice(i, i + 3);
          let th = 0;
          for (let j = 0; j < 3; j++) {
            th = (th * 31 + tri.charCodeAt(j)) | 0;
          }
          const triIdx = Math.abs(th) % this.dimension;
          vec[triIdx] += 0.35;
        }
      }
    });

    // 3. Domain semantic boosting for Computer Science & MCA keywords
    const keywords: Record<string, number> = {
      normalization: 3,
      '1nf': 5,
      '2nf': 5,
      '3nf': 5,
      bcnf: 5,
      acid: 4,
      transaction: 3,
      concurrency: 3,
      index: 3,
      'b+': 4,
      deadlock: 4,
      banker: 4,
      semaphore: 4,
      mutex: 4,
      paging: 4,
      virtual: 3,
      memory: 3,
      sql: 3,
      relational: 3,
      schema: 3,
      dependency: 4,
      functional: 3,
      candidate: 4,
      key: 3,
      decomposition: 4,
      lossless: 4,
      lock: 3,
      schedule: 3,
    };

    for (const [kw, boost] of Object.entries(keywords)) {
      if (cleaned.includes(kw)) {
        let kh = 0;
        for (let i = 0; i < kw.length; i++) {
          kh = (kh * 33 + kw.charCodeAt(i)) | 0;
        }
        const kidx = Math.abs(kh) % this.dimension;
        vec[kidx] += boost;
      }
    }

    // 4. L2 Normalization (make unit vector so cosine similarity = dot product)
    let normSq = 0;
    for (let i = 0; i < this.dimension; i++) {
      normSq += vec[i] * vec[i];
    }

    const norm = Math.sqrt(normSq);
    if (norm > 1e-9) {
      for (let i = 0; i < this.dimension; i++) {
        vec[i] /= norm;
      }
    }

    return Array.from(vec);
  }
}

export const embeddingService: IEmbeddingService = new LocalSemanticEmbeddingService();
