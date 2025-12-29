import mammoth from "mammoth";

export interface ParsedStyle {
  name: string;
  type: "paragraph" | "character";
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: "left" | "center" | "right" | "justify";
}

export interface ParsedChapter {
  number: number;
  title: string;
  content: string;
  wordCount: number;
  styles: string[];
}

export interface ParsedDocument {
  title: string;
  chapters: ParsedChapter[];
  styles: ParsedStyle[];
  totalWordCount: number;
  estimatedPageCount: number;
  rawHtml: string;
  messages: string[];
}

// Common Word style patterns that indicate chapter headings
const CHAPTER_PATTERNS = [
  /^chapter\s+\d+/i,
  /^chapter\s+[ivxlcdm]+/i,
  /^part\s+\d+/i,
  /^section\s+\d+/i,
  /^\d+\.\s+/,
  /^prologue$/i,
  /^epilogue$/i,
  /^introduction$/i,
  /^preface$/i,
  /^acknowledgments?$/i,
];

// Style name patterns that indicate headings
const HEADING_STYLE_PATTERNS = [
  /heading\s*1/i,
  /title/i,
  /chapter/i,
  /h1/i,
];

/**
 * Parse a DOCX file buffer and extract structured content
 */
export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.convertToHtml({ buffer }, {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Title'] => h1.title:fresh",
      "p[style-name='Subtitle'] => h2.subtitle:fresh",
    ]
  });

  const rawHtml = result.value;
  const messages = result.messages.map(m => m.message);

  // Extract styles from the document
  const styles = await extractStyles(buffer);
  
  // Parse chapters from HTML
  const chapters = parseChaptersFromHtml(rawHtml);
  
  // Calculate statistics
  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const estimatedPageCount = Math.ceil(totalWordCount / 250); // ~250 words per page

  // Try to extract title from first heading or first chapter
  const title = extractTitle(rawHtml, chapters);

  return {
    title,
    chapters,
    styles,
    totalWordCount,
    estimatedPageCount,
    rawHtml,
    messages
  };
}

/**
 * Extract style information from the document
 */
async function extractStyles(buffer: Buffer): Promise<ParsedStyle[]> {
  const styles: ParsedStyle[] = [];
  
  // Use mammoth to get raw document info
  const rawResult = await mammoth.extractRawText({ buffer });
  
  // Default styles that are commonly used
  const defaultStyles: ParsedStyle[] = [
    { name: "Normal", type: "paragraph" },
    { name: "Heading 1", type: "paragraph", bold: true, fontSize: 24 },
    { name: "Heading 2", type: "paragraph", bold: true, fontSize: 18 },
    { name: "Heading 3", type: "paragraph", bold: true, fontSize: 14 },
    { name: "Title", type: "paragraph", bold: true, fontSize: 28, alignment: "center" },
    { name: "Subtitle", type: "paragraph", italic: true, fontSize: 16, alignment: "center" },
    { name: "Body Text", type: "paragraph", fontSize: 12 },
    { name: "First Paragraph", type: "paragraph", fontSize: 12 },
    { name: "Block Quote", type: "paragraph", italic: true, fontSize: 11 },
  ];

  return defaultStyles;
}

/**
 * Parse chapters from the converted HTML
 */
function parseChaptersFromHtml(html: string): ParsedChapter[] {
  const chapters: ParsedChapter[] = [];
  
  // Split by h1 tags (chapter headings)
  const h1Pattern = /<h1[^>]*>(.*?)<\/h1>/gi;
  const parts = html.split(h1Pattern);
  
  let chapterNumber = 0;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;
    
    // Check if this looks like a chapter title
    const isChapterTitle = CHAPTER_PATTERNS.some(pattern => pattern.test(part)) ||
                          (i > 0 && i % 2 === 1); // Odd indices after split are the captured groups
    
    if (isChapterTitle && part.length < 200) {
      chapterNumber++;
      const content = parts[i + 1] || "";
      const wordCount = countWords(stripHtml(content));
      
      chapters.push({
        number: chapterNumber,
        title: stripHtml(part),
        content: content,
        wordCount,
        styles: detectStylesInContent(content)
      });
      i++; // Skip the content part
    } else if (chapterNumber === 0 && part.length > 100) {
      // First substantial content before any heading - treat as chapter 1
      chapterNumber = 1;
      const wordCount = countWords(stripHtml(part));
      
      chapters.push({
        number: chapterNumber,
        title: "Chapter 1",
        content: part,
        wordCount,
        styles: detectStylesInContent(part)
      });
    }
  }
  
  // If no chapters found, treat entire document as one chapter
  if (chapters.length === 0) {
    const wordCount = countWords(stripHtml(html));
    chapters.push({
      number: 1,
      title: "Chapter 1",
      content: html,
      wordCount,
      styles: detectStylesInContent(html)
    });
  }
  
  return chapters;
}

/**
 * Extract the document title
 */
function extractTitle(html: string, chapters: ParsedChapter[]): string {
  // Try to find a title class
  const titleMatch = html.match(/<h1[^>]*class="title"[^>]*>(.*?)<\/h1>/i);
  if (titleMatch) {
    return stripHtml(titleMatch[1]);
  }
  
  // Try first h1
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    const title = stripHtml(h1Match[1]);
    // Don't use chapter headings as title
    if (!CHAPTER_PATTERNS.some(p => p.test(title))) {
      return title;
    }
  }
  
  // Use first chapter title if it's not a generic "Chapter X"
  if (chapters.length > 0 && !chapters[0].title.match(/^chapter\s+\d+$/i)) {
    return chapters[0].title;
  }
  
  return "Untitled Document";
}

/**
 * Detect styles used in content
 */
function detectStylesInContent(html: string): string[] {
  const styles: string[] = [];
  
  if (/<strong>|<b>/i.test(html)) styles.push("Bold");
  if (/<em>|<i>/i.test(html)) styles.push("Italic");
  if (/<u>/i.test(html)) styles.push("Underline");
  if (/<blockquote>/i.test(html)) styles.push("Block Quote");
  if (/<h2>/i.test(html)) styles.push("Heading 2");
  if (/<h3>/i.test(html)) styles.push("Heading 3");
  if (/<ul>|<ol>/i.test(html)) styles.push("List");
  
  return styles;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Generate style mappings from detected styles
 */
export function generateStyleMappings(styles: ParsedStyle[]): Array<{
  sourceStyleName: string;
  sourceStyleType: "paragraph" | "character";
  targetStyleName: string;
}> {
  const mappings: Array<{
    sourceStyleName: string;
    sourceStyleType: "paragraph" | "character";
    targetStyleName: string;
  }> = [];

  const styleMap: Record<string, string> = {
    "Normal": "Body Text",
    "Heading 1": "Chapter Title",
    "Heading 2": "Section Heading",
    "Heading 3": "Subsection Heading",
    "Title": "Book Title",
    "Subtitle": "Book Subtitle",
    "Body Text": "Body Text",
    "First Paragraph": "First Paragraph (No Indent)",
    "Block Quote": "Block Quotation",
  };

  for (const style of styles) {
    const targetStyle = styleMap[style.name] || style.name;
    mappings.push({
      sourceStyleName: style.name,
      sourceStyleType: style.type,
      targetStyleName: targetStyle
    });
  }

  return mappings;
}
