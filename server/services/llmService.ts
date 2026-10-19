import { GoogleGenAI } from '@google/genai';
import { ConstructedContext } from './contextBuilder';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMGenerationOptions {
  query: string;
  context: ConstructedContext;
  docName?: string;
  history?: ChatHistoryMessage[];
}

export interface LLMResponse {
  answer: string;
  isGrounded: boolean;
  insufficientInfo: boolean;
}

export class LLMService {
  private aiClient: GoogleGenAI | null = null;
  private modelCooldowns: Map<string, number> = new Map();

  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
      if (!this.aiClient) {
        try {
          this.aiClient = new GoogleGenAI({ apiKey: apiKey.trim() });
        } catch {
          // Graceful fallback to local synthesis if SDK initialization fails
        }
      }
      return this.aiClient;
    }
    return null;
  }

  async generateGroundedAnswer(options: LLMGenerationOptions): Promise<LLMResponse> {
    const { query, context, docName, history } = options;

    // Answer Not Found Behavior - friendly and conversational
    if (!context.contextString.trim() || context.sourcesList.length === 0) {
      return {
        answer:
          `Based on your uploaded course materials and handwritten notes ${docName ? `("${docName}")` : ''}, there isn't enough information to answer your question about "${query}".\n\n` +
          `Your currently indexed resources don't cover this specific concept. You can upload additional handwritten notes, textbook pages, or lecture slides on this topic, and I'll immediately index them to give you an accurate, grounded answer!`,
        isGrounded: false,
        insufficientInfo: true,
      };
    }

    const client = this.getClient();
    if (client) {
      try {
        const systemInstruction =
          `You are an expert, authoritative, and articulate AI Academic Study Tutor powered by the student's own uploaded course materials, textbooks, and handwritten notes.\n\n` +
          `CORE TEACHING & ANSWERING PRINCIPLES:\n` +
          `1. DIRECT & ACCURATE ANSWER FIRST:\n` +
          `   - Begin by answering the student's question directly, clearly, and authoritatively in the very first 1-2 sentences.\n` +
          `   - Ground your answer completely and accurately in the provided supporting course materials and handwritten notes.\n` +
          `   - Explain concepts intuitively in your own words while retaining the exact technical terminology, definitions, formulas, and laws from the source resources.\n\n` +
          `2. UNDERSTANDING HANDWRITTEN BOOKS, SCANS & DIAGRAMS:\n` +
          `   - The supporting materials may include transcriptions from handwritten notebooks, cursive lecture notes, whiteboard photos, or scanned textbooks.\n` +
          `   - Pay close attention to handwritten definitions, formulas, arrows, numbered proofs, algorithm steps, and diagram analyses.\n` +
          `   - If a handwritten diagram, table, or flowchart is described in the text (e.g. process states, entity-relationship diagrams, network layers, memory maps), explain its components, relationships, and transitions clearly.\n\n` +
          `3. PEDAGOGY, STRUCTURE & CLARITY:\n` +
          `   - Use structured markdown formatting: bold key terms, intuitive subheadings (###), bullet points, numbered steps, and markdown tables when comparing concepts.\n` +
          `   - For mathematical equations, functional dependencies (e.g., X → Y), relational schemas, or algorithms, format them clearly using readable notation or LaTeX (e.g., $X \\to Y$).\n` +
          `   - Conclude with a helpful "Key Takeaway" or "Exam Tip" that highlights how to present this answer in university examinations.\n\n` +
          `4. STRICT FIDELITY & NO HALLUCINATION:\n` +
          `   - If the uploaded notes contain specific numerical examples, schemas, or steps, use those exact examples to ground your explanation.\n` +
          `   - If the student asks about something partially covered, explain the covered part accurately and clearly indicate what part is not mentioned in the notes.\n\n` +
          `5. PROHIBITED SYSTEM JARGON:\n` +
          `   - NEVER use internal pipeline jargon such as "chunks", "embeddings", "vector databases", "vectors", "retrieval", "RAG", "similarity scores", "Top-K", or "retrieved context".\n` +
          `   - Refer naturally to "your uploaded lecture notes", "the textbook chapter", "your course syllabus", or "your handwritten notes".`;

        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        // Attach previous conversation context (up to last 6 turns)
        if (history && history.length > 0) {
          const recentHistory = history.slice(-6);
          for (const item of recentHistory) {
            contents.push({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.content }],
            });
          }
        }

        // Add current turn with supporting material context
        const currentTurnPrompt =
          `[SUPPORTING COURSE MATERIAL & HANDWRITTEN RESOURCE EXCERPTS]\n` +
          `${context.contextString}\n\n` +
          `[STUDENT QUESTION]\n` +
          `${query}`;

        contents.push({
          role: 'user',
          parts: [{ text: currentTurnPrompt }],
        });

        // Model priority hierarchy: gemini-3.8-flash has first-rate multimodal reasoning and high throughput
        const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
        const now = Date.now();

        for (const modelName of candidateModels) {
          const cooldownUntil = this.modelCooldowns.get(modelName) || 0;
          if (now < cooldownUntil) {
            continue; // Skip models currently in rate-limit or demand cooldown
          }

          try {
            const response = await client.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction,
                temperature: 0.25,
              },
            });

            const text = response.text || '';
            if (text.trim()) {
              return {
                answer: text.trim(),
                isGrounded: true,
                insufficientInfo: false,
              };
            }
          } catch (modelErr: any) {
            const errMsg = String(modelErr?.message || '');
            const is429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED');
            const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE');

            const cooldownDuration = is429 ? 60000 : is503 ? 20000 : 15000;
            this.modelCooldowns.set(modelName, Date.now() + cooldownDuration);
          }
        }
      } catch {
        // Fall back gracefully to local tutor synthesis
      }
    }

    // High-quality local tutor synthesis fallback
    return this.synthesizeLocally(query, context, docName);
  }

  /**
   * Generates an articulate, structured explanation directly derived from
   * the retrieved document context when running in local fallback.
   */
  private synthesizeLocally(
    query: string,
    context: ConstructedContext,
    docName?: string
  ): LLMResponse {
    const primarySource = context.sourcesList[0];
    const sourceSection =
      primarySource?.heading ||
      primarySource?.section ||
      (docName ? docName.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ') : 'Course Resource');

    // Parse meaningful sentences and paragraphs from the retrieved chunks
    const rawContent = (context.contextString || '') + '\n' + context.sourcesList.map((s) => s.snippet).join('\n');
    const lines = rawContent.split('\n');
    const meaningfulParagraphs: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine
        .replace(/^\[SOURCE \d+[^\]]*\]/, '')
        .replace(/^#+\s*/, '')
        .replace(/^(Page \d+|Unit \d+:|Chapter \d+:).*/i, '')
        .trim();

      if (
        line.length > 25 &&
        !line.startsWith('---') &&
        !line.startsWith('===') &&
        !meaningfulParagraphs.includes(line)
      ) {
        meaningfulParagraphs.push(line);
      }
    }

    const topicTitle = this.extractTopicTitle(query, sourceSection);
    const sections: string[] = [];

    // 1. Direct answer / Overview
    sections.push(
      `### ${topicTitle}\n\n` +
      `Based on your course materials and notes for **${sourceSection}**, here is the comprehensive breakdown:\n`
    );

    // 2. Core Definitions and Rules from the actual chunks
    const definitionLines = meaningfulParagraphs.filter((l) =>
      /definition|specifies|represents|is in|holds|eliminates|satisfies|condition|rule|theorem|property|algorithm/i.test(l)
    );

    if (definitionLines.length > 0) {
      sections.push(
        `#### Key Principles & Definitions\n` +
        definitionLines.slice(0, 4).map((d) => `- **${this.formatBulletTitle(d)}**: ${d}`).join('\n')
      );
    } else if (meaningfulParagraphs.length > 0) {
      sections.push(
        `#### Key Concepts\n` +
        meaningfulParagraphs.slice(0, 3).map((l) => `- ${l}`).join('\n')
      );
    }

    // 3. Illustrative Examples & Analysis
    const exampleLines = meaningfulParagraphs.filter((l) =>
      /example|relation|table|step|case|solution|diagram|schema|process/i.test(l)
    );

    if (exampleLines.length > 0) {
      sections.push(
        `#### Step-by-Step Breakdown & Examples\n` +
        exampleLines.slice(0, 3).map((ex) => `- ${ex}`).join('\n')
      );
    } else if (meaningfulParagraphs.length > 3) {
      sections.push(
        `#### Additional Details from Resource\n` +
        meaningfulParagraphs.slice(3, 6).map((m) => `- ${m}`).join('\n')
      );
    }

    // 4. Summary & Exam Tip
    sections.push(
      `#### Exam Application & Key Takeaway\n` +
      `- **Conceptual Core**: Focus on the core definition and formal conditions outlined in the source notes.\n` +
      `- **Presentation Tip**: In semester examinations, state the formal definition first, highlight any invariants or rules, and support your explanation with a clean diagram or step-by-step example.`
    );

    return {
      answer: sections.join('\n\n'),
      isGrounded: true,
      insufficientInfo: false,
    };
  }

  private extractTopicTitle(query: string, defaultSection: string): string {
    const q = query.trim();
    if (/2nf|second normal form/i.test(q)) return 'Second Normal Form (2NF)';
    if (/3nf|third normal form/i.test(q)) return 'Third Normal Form (3NF)';
    if (/bcnf|boyce-codd/i.test(q)) return 'Boyce-Codd Normal Form (BCNF)';
    if (/1nf|first normal form/i.test(q)) return 'First Normal Form (1NF)';
    if (/acid/i.test(q)) return 'ACID Properties in Transactions';
    if (/candidate key/i.test(q)) return 'Candidate Keys & Superkeys';
    if (/functional depend/i.test(q)) return 'Functional Dependencies (FD)';
    if (/deadlock/i.test(q)) return 'Deadlock Conditions & Prevention';
    if (/semaphore|mutex/i.test(q)) return 'Semaphores & Mutual Exclusion';
    if (/paging|page fault/i.test(q)) return 'Paging & Memory Management';
    if (/tcp|udp/i.test(q)) return 'TCP vs UDP Protocols';
    return defaultSection || q;
  }

  private formatBulletTitle(text: string): string {
    if (/definition:/i.test(text)) return 'Definition';
    if (/functional/i.test(text)) return 'Dependency Condition';
    if (/candidate/i.test(text)) return 'Key Property';
    if (/elimina/i.test(text)) return 'Rule';
    if (/algorithm/i.test(text)) return 'Procedure';
    if (/condition/i.test(text)) return 'Requirement';
    return 'Key Concept';
  }
}

export const llmService = new LLMService();
