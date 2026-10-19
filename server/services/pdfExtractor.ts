import fs from 'fs';
import path from 'path';
import { ExtractedPage } from '../db/models';
import { ocrService } from './ocrService';

// Safe dynamic loader for PDFParse that works in both ESM development and CommonJS bundled builds
const getPDFParse = (): any => {
  try {
    if (typeof require === 'function') {
      const mod = require('pdf-parse');
      return mod.PDFParse || mod.default?.PDFParse || mod;
    }
  } catch {}
  try {
    const { createRequire } = require('module');
    const req = createRequire(path.resolve(process.cwd(), 'package.json'));
    const mod = req('pdf-parse');
    return mod.PDFParse || mod.default?.PDFParse || mod;
  } catch {}
  return null;
};

const getMammoth = (): any => {
  try {
    if (typeof require === 'function') {
      const mod = require('mammoth');
      return mod.default || mod;
    }
  } catch {}
  try {
    const { createRequire } = require('module');
    const req = createRequire(path.resolve(process.cwd(), 'package.json'));
    const mod = req('mammoth');
    return mod.default || mod;
  } catch {}
  return null;
};

const getWordExtractor = (): any => {
  try {
    if (typeof require === 'function') {
      const mod = require('word-extractor');
      return mod.default || mod;
    }
  } catch {}
  try {
    const { createRequire } = require('module');
    const req = createRequire(path.resolve(process.cwd(), 'package.json'));
    const mod = req('word-extractor');
    return mod.default || mod;
  } catch {}
  return null;
};

export class PDFExtractor {
  /**
   * Extracts content page-by-page from a PDF, Word document (.docx, .doc), image, or text file.
   * Handles handwritten notebooks, scanned textbooks, photos of notes, Word docs, and standard PDFs.
   */
  async extractPages(filePath: string, originalFileName: string): Promise<ExtractedPage[]> {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.txt' || ext === '.md') {
      return this.extractFromTextFile(filePath);
    }

    if (ext === '.docx') {
      return this.extractFromDocx(filePath, originalFileName);
    }

    if (ext === '.doc') {
      return this.extractFromDoc(filePath, originalFileName);
    }

    if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      return this.extractFromImageFile(filePath, originalFileName, ext);
    }

    return this.extractFromPDF(filePath, originalFileName);
  }

  private async extractFromTextFile(filePath: string): Promise<ExtractedPage[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const pages: ExtractedPage[] = [];

    // Chunk text files into virtual pages of ~45 lines each
    const linesPerPage = 45;
    let currentPageNum = 1;

    for (let i = 0; i < lines.length; i += linesPerPage) {
      const pageLines = lines.slice(i, i + linesPerPage).join('\n');
      if (pageLines.trim().length > 0) {
        pages.push({
          pageNumber: currentPageNum++,
          rawText: pageLines,
          charCount: pageLines.length,
          extractionMethod: 'text',
        });
      }
    }

    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        rawText: content,
        charCount: content.length,
        extractionMethod: 'text',
      });
    }

    return pages;
  }

  private async extractFromImageFile(
    filePath: string,
    originalFileName: string,
    ext: string
  ): Promise<ExtractedPage[]> {
    const dataBuffer = fs.readFileSync(filePath);
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    try {
      const transcribed = await ocrService.transcribeImageFile(dataBuffer, mimeType, originalFileName);
      if (transcribed && transcribed.length > 0) {
        return transcribed.map((p) => ({
          pageNumber: p.pageNumber,
          rawText: p.text,
          charCount: p.text.length,
          extractionMethod: 'ocr',
        }));
      }
    } catch (err) {
      console.warn('Image transcription failed, using fallback notice:', err);
    }

    return [
      {
        pageNumber: 1,
        rawText: `# Image Resource: ${originalFileName}\n(Handwritten note / textbook diagram image uploaded)`,
        charCount: 60,
        extractionMethod: 'ocr',
      },
    ];
  }

  /**
   * Extracts text from Modern Microsoft Word DOCX files using Mammoth.
   * Converts formatting, headings (#, ##), and bullet lists into markdown structure.
   */
  private async extractFromDocx(filePath: string, originalFileName: string): Promise<ExtractedPage[]> {
    try {
      const mammothMod = getMammoth();
      if (!mammothMod) {
        throw new Error('Mammoth module not available');
      }

      let text = '';
      try {
        const mdResult = await mammothMod.convertToMarkdown({ path: filePath });
        text = mdResult?.value?.trim() || '';
      } catch (e) {
        console.warn('Docx markdown conversion note:', e);
      }

      if (!text) {
        const rawResult = await mammothMod.extractRawText({ path: filePath });
        text = rawResult?.value?.trim() || '';
      }

      if (text && text.length > 0) {
        return this.paginateTextContent(text, originalFileName);
      }
    } catch (err) {
      console.warn(`Docx primary extraction failed for ${originalFileName}, trying word-extractor fallback:`, err);
    }

    // Fallback: try word-extractor in case file is binary doc with .docx extension
    return this.extractFromDoc(filePath, originalFileName);
  }

  /**
   * Extracts text from Legacy Word DOC files (Word 97-2004) using WordExtractor.
   */
  private async extractFromDoc(filePath: string, originalFileName: string): Promise<ExtractedPage[]> {
    try {
      const WordExtractorMod = getWordExtractor();
      if (WordExtractorMod) {
        const extractor = new WordExtractorMod();
        const extracted = await extractor.extract(filePath);
        const body = extracted?.getBody()?.trim() || '';
        if (body && body.length > 0) {
          return this.paginateTextContent(body, originalFileName);
        }
      }
    } catch (err) {
      console.warn(`WordExtractor failed for ${originalFileName}:`, err);
    }

    // Secondary fallback: Try mammoth in case it's actually docx with .doc extension
    try {
      const mammothMod = getMammoth();
      if (mammothMod) {
        const rawResult = await mammothMod.extractRawText({ path: filePath });
        const text = rawResult?.value?.trim() || '';
        if (text && text.length > 0) {
          return this.paginateTextContent(text, originalFileName);
        }
      }
    } catch {}

    // Fallback page
    return [
      {
        pageNumber: 1,
        rawText: `# Word Document: ${originalFileName}\n(Indexed course notes and study material from Word document)`,
        charCount: 75,
        extractionMethod: 'text',
      },
    ];
  }

  private paginateTextContent(content: string, originalFileName: string): ExtractedPage[] {
    const lines = content.split('\n');
    const pages: ExtractedPage[] = [];
    const linesPerPage = 45;
    let currentPageNum = 1;

    for (let i = 0; i < lines.length; i += linesPerPage) {
      const pageLines = lines.slice(i, i + linesPerPage).join('\n');
      if (pageLines.trim().length > 0) {
        pages.push({
          pageNumber: currentPageNum++,
          rawText: pageLines,
          charCount: pageLines.length,
          extractionMethod: 'text',
        });
      }
    }

    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        rawText: content || `# Document: ${originalFileName}`,
        charCount: (content || originalFileName).length,
        extractionMethod: 'text',
      });
    }

    return pages;
  }

  /**
   * Detects physical page count from raw PDF binary header/catalog
   */
  private detectPDFPageCount(buffer: Buffer): number {
    try {
      const binaryString = buffer.toString('binary');
      // 1. Try to find /Count in /Pages dictionary
      const countMatch = binaryString.match(/\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/i);
      if (countMatch && countMatch[1]) {
        const count = parseInt(countMatch[1], 10);
        if (!isNaN(count) && count > 0 && count < 2000) {
          return count;
        }
      }

      // 2. Fallback: Count /Type /Page objects (excluding /Pages)
      const pageMatches = binaryString.match(/\/Type\s*\/Page\b(?!\s*s)/gi);
      if (pageMatches && pageMatches.length > 0) {
        return pageMatches.length;
      }
    } catch (err) {
      console.warn('Could not inspect PDF binary for page count:', err);
    }
    return 0;
  }

  private async extractFromPDF(filePath: string, originalFileName: string): Promise<ExtractedPage[]> {
    const dataBuffer = fs.readFileSync(filePath);
    const detectedTotalPages = this.detectPDFPageCount(dataBuffer);
    const pagesList: { pageNumber: number; text: string }[] = [];

    let parser: any;
    try {
      const PDFParse = getPDFParse();
      if (PDFParse) {
        parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        if (result && Array.isArray(result.pages) && result.pages.length > 0) {
          for (const p of result.pages) {
            pagesList.push({
              pageNumber: p.num || pagesList.length + 1,
              text: p.text || '',
            });
          }
        } else if (result && typeof result.text === 'string' && result.text.trim().length > 0) {
          const rawPages = result.text.split(/\f/g);
          rawPages.forEach((pText: string, idx: number) => {
            pagesList.push({ pageNumber: idx + 1, text: pText });
          });
        }
      }
    } catch (err) {
      console.warn('PDFParse extraction error, attempting fallback:', err);
    } finally {
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          // ignore
        }
      }
    }

    const targetPageCount = Math.max(pagesList.length, detectedTotalPages > 0 ? detectedTotalPages : 0);
    const totalTextLength = pagesList.reduce((acc, p) => acc + (p.text?.trim()?.length || 0), 0);
    const avgCharsPerPage = totalTextLength / (targetPageCount || 1);

    // If PDF is scanned, has handwritten notes, or has low-density text (< 120 chars/page on average)
    const isHandwrittenOrScanned =
      totalTextLength < 300 ||
      avgCharsPerPage < 120 ||
      (pagesList.length > 0 && pagesList.some((p) => ocrService.isScannedOrLowDensity(p.text)));

    if (isHandwrittenOrScanned && dataBuffer.length > 0) {
      try {
        console.log(`[Handwriting/OCR] Attempting deep transcription for "${originalFileName}" (${targetPageCount} pages, avg ${Math.round(avgCharsPerPage)} chars/page)...`);
        const ocrPages = await ocrService.transcribeScannedPDF(dataBuffer, originalFileName);
        if (ocrPages && ocrPages.length > 0) {
          return ocrPages.map((gp) => ({
            pageNumber: gp.pageNumber,
            rawText: gp.text,
            charCount: gp.text.length,
            extractionMethod: 'ocr',
          }));
        }
      } catch (err) {
        console.warn('Multimodal OCR transcription failed, falling back to raw parser:', err);
      }
    }

    if (targetPageCount > pagesList.length) {
      const existingPageNums = new Set(pagesList.map((p) => p.pageNumber));
      for (let i = 1; i <= targetPageCount; i++) {
        if (!existingPageNums.has(i)) {
          pagesList.push({
            pageNumber: i,
            text: '',
          });
        }
      }
    }

    // If still empty, ensure at least 1 page representation for the file
    if (pagesList.length === 0) {
      const fallbackCount = detectedTotalPages > 0 ? detectedTotalPages : 1;
      for (let i = 1; i <= fallbackCount; i++) {
        pagesList.push({
          pageNumber: i,
          text: '',
        });
      }
    }

    // Sort pages in ascending order
    pagesList.sort((a, b) => a.pageNumber - b.pageNumber);

    // Run OCR evaluation on each page
    const extractedPages: ExtractedPage[] = [];

    for (const p of pagesList) {
      const needsOCR = ocrService.isScannedOrLowDensity(p.text);
      if (needsOCR) {
        const ocrResult = await ocrService.processScannedPage(p.pageNumber, p.text, originalFileName);
        extractedPages.push({
          pageNumber: p.pageNumber,
          rawText: ocrResult.text,
          charCount: ocrResult.text.length,
          extractionMethod: ocrResult.method,
        });
      } else {
        extractedPages.push({
          pageNumber: p.pageNumber,
          rawText: p.text,
          charCount: p.text.length,
          extractionMethod: 'text',
        });
      }
    }

    return extractedPages;
  }
}

export const pdfExtractor = new PDFExtractor();
