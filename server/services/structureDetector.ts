/**
 * Structure Detection Service
 * Requirement #10: Detects chapters, units, sections, headings, definitions,
 * and preserves hierarchical context without hallucinating arbitrary structures.
 */

export interface DetectedStructure {
  chapter?: string;
  section?: string;
  heading?: string;
  isList: boolean;
  isDefinition: boolean;
  isTable: boolean;
}

export class StructureDetector {
  /**
   * Confidently detects structure elements in a line of text.
   */
  detectLineStructure(line: string): { type: 'heading' | 'section' | 'definition' | 'normal'; title: string } {
    const trimmed = line.trim();

    // 1. Chapter / Unit match: "Chapter 1: ...", "Unit 2: ..."
    const chapterMatch = trimmed.match(/^(?:chapter|unit|module)\s*(\d+|[IVXLCDM]+)[\s:\-\–]+(.+)/i);
    if (chapterMatch) {
      return { type: 'section', title: `${chapterMatch[0]}` };
    }

    // 2. Numbered Section match: "1.1 Introduction", "3.2 Normalization", "4.2.1 BCNF"
    const sectionMatch = trimmed.match(/^(\d+(\.\d+)+)\s+([A-Za-z0-9\s,\-\(\)]+)/);
    if (sectionMatch) {
      return { type: 'section', title: sectionMatch[0] };
    }

    // 3. Markdown or uppercase headings: "### 2NF Definition", "SECOND NORMAL FORM"
    if (trimmed.startsWith('#')) {
      return { type: 'heading', title: trimmed.replace(/^#+\s*/, '') };
    }

    if (
      trimmed.length > 3 &&
      trimmed.length < 60 &&
      trimmed === trimmed.toUpperCase() &&
      /^[A-Z0-9\s\-\:\(\)]+$/.test(trimmed)
    ) {
      return { type: 'heading', title: trimmed };
    }

    // 4. Definition indicator: "Definition:", "Theorem 2.1:"
    if (/^(definition|theorem|lemma|algorithm|corollary)\b/i.test(trimmed)) {
      return { type: 'definition', title: trimmed.split(':')[0] || trimmed };
    }

    return { type: 'normal', title: '' };
  }

  /**
   * Extracts headings and structural markers for an entire page.
   */
  extractPageHeadings(pageText: string): string[] {
    const lines = pageText.split('\n');
    const headings: string[] = [];

    for (const line of lines) {
      const struct = this.detectLineStructure(line);
      if (struct.type !== 'normal' && struct.title) {
        headings.push(struct.title);
      }
    }

    return headings;
  }
}

export const structureDetector = new StructureDetector();
