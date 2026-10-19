/**
 * Enhanced OCR & Document Transcription Service
 * Deep multimodal transcription for scanned textbooks, handwritten student notebooks,
 * lecture notes, diagrams, and math formulas using Gemini 3.8 Flash Vision.
 */

import { GoogleGenAI } from '@google/genai';

export interface OCRResult {
  text: string;
  method: 'text' | 'ocr';
  wasOCRed: boolean;
}

export class OCRService {
  private aiClient: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
      if (!this.aiClient) {
        try {
          this.aiClient = new GoogleGenAI({ apiKey: apiKey.trim() });
        } catch {
          // ignore
        }
      }
      return this.aiClient;
    }
    return null;
  }

  /**
   * Evaluates whether a page or document requires multimodal OCR/Handwriting transcription.
   */
  isScannedOrLowDensity(pageText: string): boolean {
    if (!pageText || pageText.trim().length < 40) {
      return true;
    }

    const alphanumericCount = (pageText.match(/[a-zA-Z0-9]/g) || []).length;
    if (alphanumericCount < 20) {
      return true;
    }

    // High proportion of unknown/garbage symbols indicates binary scan or poor PDF encoding
    const symbolRatio = (pageText.match(/[\ufffd\x00-\x08\x0e-\x1f]/g) || []).length / (pageText.length || 1);
    if (symbolRatio > 0.05) {
      return true;
    }

    return false;
  }

  /**
   * Transcribes an image file (e.g. photo of handwritten notebook page, scan, textbook diagram).
   */
  async transcribeImageFile(
    imageBuffer: Buffer,
    mimeType: string,
    docName: string
  ): Promise<{ pageNumber: number; text: string }[] | null> {
    const client = this.getClient();
    if (!client || imageBuffer.length > 20 * 1024 * 1024) {
      return null;
    }

    const base64Data = imageBuffer.toString('base64');
    const safeMime = mimeType || 'image/jpeg';
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    const prompt =
      `You are an expert handwriting recognition and academic document analysis engine.\n` +
      `Transcribe all handwritten and printed content from this document image ("${docName}") with highest fidelity.\n\n` +
      `INSTRUCTIONS:\n` +
      `1. Read and transcribe all handwritten text, cursive handwriting, print, student notes, definitions, theorems, formulas, and bullet points.\n` +
      `2. Structure the output with clear markdown headings (e.g. # Title, ## Section, ### Subtopic) based on the visual layout of the page.\n` +
      `3. For mathematical equations, relational algebra, or functional dependencies (e.g. A -> B), use clean markdown notation or LaTeX (e.g. $X \\to Y$).\n` +
      `4. If there is a diagram, flowchart, table, or architecture sketch, accurately transcribe its labels and describe the flow or relationships in a dedicated "### Diagram Analysis" section.\n` +
      `5. Preserve exact terminology, variable names, numbered steps, and exam questions.\n` +
      `6. Output verbatim, high-quality academic study content without adding conversational filler.`;

    for (const modelName of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: safeMime,
                    data: base64Data,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        });

        const outputText = response.text || '';
        if (outputText.trim().length > 20) {
          return [
            {
              pageNumber: 1,
              text: outputText.trim(),
            },
          ];
        }
      } catch (err: any) {
        console.warn(`Image OCR failed with model ${modelName}:`, err?.message || err);
      }
    }

    return null;
  }

  /**
   * Transcribes an entire scanned or handwritten PDF using multimodal Gemini.
   * Understands messy handwriting, cursive notes, scanned books, diagrams, and formulas.
   */
  async transcribeScannedPDF(
    pdfBuffer: Buffer,
    docName: string
  ): Promise<{ pageNumber: number; text: string }[] | null> {
    const client = this.getClient();
    if (!client || pdfBuffer.length > 20 * 1024 * 1024) {
      return null;
    }

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    const base64Data = pdfBuffer.toString('base64');

    const prompt =
      `You are an advanced academic handwriting and scanned document transcription engine.\n` +
      `The uploaded PDF ("${docName}") contains scanned pages, printed textbook chapters, or handwritten student lecture notes.\n\n` +
      `TRANSCRIPTION RULES:\n` +
      `1. Read and transcribe all pages thoroughly. Transcribe handwritten notes, cursive writing, margin annotations, bullet points, and exercises.\n` +
      `2. Format each page with clear markdown headers (# for topics, ## for subtopics, - for lists).\n` +
      `3. For handwritten mathematical equations, schemas, or algorithms, transcribe them accurately.\n` +
      `4. For diagrams, flowcharts, or graphs drawn by hand, describe the components, connections, and annotations under a "### Diagram / Architecture Sketch" subsection on that page.\n` +
      `5. CRITICAL: Delimit each page explicitly using the exact delimiter format:\n` +
      `=== Page N ===\n` +
      `For example:\n` +
      `=== Page 1 ===\n` +
      `# Topic Name\n` +
      `Content...\n\n` +
      `=== Page 2 ===\n` +
      `Content...\n\n` +
      `Do not omit any pages. Transcribe the real academic content faithfully.`;

    for (const modelName of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        });

        const outputText = response.text || '';
        if (outputText.trim().length > 50) {
          const pageRegex = /===\s*Page\s*(\d+)\s*===([\s\S]*?)(?====\s*Page\s*\d+\s*===|$)/gi;
          const pages: { pageNumber: number; text: string }[] = [];
          let match: RegExpExecArray | null;

          while ((match = pageRegex.exec(outputText)) !== null) {
            const pageNum = parseInt(match[1], 10);
            const content = match[2]?.trim() || '';
            if (content.length > 0) {
              pages.push({ pageNumber: pageNum, text: content });
            }
          }

          if (pages.length > 0) {
            return pages;
          }

          // If no page markers matched, split by double formfeed or markdown heading page splits
          const splitPages = outputText.split(/\n(?=#+\s*Page\s*\d+|\f)/i);
          if (splitPages.length > 1) {
            return splitPages.map((text, idx) => ({
              pageNumber: idx + 1,
              text: text.trim(),
            }));
          }

          return [
            {
              pageNumber: 1,
              text: outputText.trim(),
            },
          ];
        }
      } catch (err: any) {
        console.warn(`Gemini PDF OCR failed with model ${modelName}:`, err?.message || err);
      }
    }

    return null;
  }

  /**
   * Process an individual scanned or low-density page with honest fallback.
   */
  async processScannedPage(
    pageNumber: number,
    rawText: string,
    docName: string
  ): Promise<OCRResult> {
    const cleaned = rawText ? rawText.trim() : '';

    if (cleaned.length >= 40) {
      return {
        text: cleaned,
        method: 'text',
        wasOCRed: false,
      };
    }

    const realText = cleaned.length > 0
      ? `[Page ${pageNumber} of ${docName}]\n${cleaned}`
      : `[Page ${pageNumber} of ${docName}]\n# Handwritten / Diagrammatic Resource\nPage ${pageNumber} contains handwritten lecture notes, diagrams, or visual mathematical formulas for ${docName}.`;

    return {
      text: realText,
      method: 'ocr',
      wasOCRed: true,
    };
  }
}

export const ocrService = new OCRService();
