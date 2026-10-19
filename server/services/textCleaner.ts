/**
 * Text Cleaning Layer
 * Requirement #9: Normalizes extraction noise, fixes broken hyphenations,
 * removes running headers/footers and isolated page numbers while strictly
 * preserving headings, definitions, numbered lists, math formulas, and tables.
 */

export class TextCleaner {
  cleanPageText(rawText: string, pageNumber: number): string {
    if (!rawText) return '';

    let text = rawText;

    // 1. Normalize line endings
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 2. Fix broken hyphenated line breaks (e.g., "fundamen-\ntal" -> "fundamental")
    text = text.replace(/([a-zA-Z]{2,})-\n([a-zA-Z]{2,})/g, '$1$2');

    // 3. Remove standalone running headers/footers matching "Page X", "Page X of Y", "- X -"
    const lines = text.split('\n');
    const filteredLines = lines.filter((line) => {
      const trimmed = line.trim();
      // Remove isolated page number indicators on their own line
      if (/^(page\s*\d+(\s*of\s*\d+)?|\d+|\-\s*\d+\s*\-)$/i.test(trimmed)) {
        return false;
      }
      // Remove common repeated running footers
      if (/^(all rights reserved|confidential|internal circulation only)$/i.test(trimmed)) {
        return false;
      }
      return true;
    });

    text = filteredLines.join('\n');

    // 4. Clean up excessive horizontal whitespace while preserving paragraph breaks
    text = text
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n');

    // 5. Replace 3+ consecutive line breaks with 2 line breaks (standard paragraph break)
    text = text.replace(/\n{3,}/g, '\n\n');

    // 6. Fix common character extraction artifacts
    text = text
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, '')
      .replace(/(\b[a-zA-Z]\b)\s+(\b[a-zA-Z]\b)\s+(\b[a-zA-Z]\b)/g, (match) => {
        // Only fix if it's spaced out letters like "D B M S"
        const compact = match.replace(/\s+/g, '');
        if (compact.length >= 3 && /^[A-Z]+$/.test(compact)) {
          return compact;
        }
        return match;
      });

    return text.trim();
  }
}

export const textCleaner = new TextCleaner();
