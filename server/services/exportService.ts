/**
 * Export Service for DesignIQ
 * Handles generation of PDF and IDML export files
 */

import archiver from "archiver";
import { Readable } from "stream";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { 
  generateBookHtml, 
  BOOK_THEMES, 
  TRIM_SIZES,
  PDFGenerationOptions 
} from "./pdfGenerator";
import { generateIDMLStructure, IDMLGenerationOptions } from "./idmlGenerator";

export interface ExportInput {
  projectId: number;
  userId: number;
  title: string;
  author?: string;
  themeId: string;
  trimSizeKey: string;
  chapters: Array<{
    number: number;
    title: string;
    content: string;
  }>;
  copyrightPage: {
    isbn?: string;
    publisherName?: string;
    publishYear?: number;
    copyrightHolder?: string;
    legalText?: string;
    additionalCredits?: string;
  } | null;
}

export interface ExportResult {
  pdfUrl?: string;
  idmlUrl?: string;
  htmlUrl?: string;
}

/**
 * Generate IDML package and upload to S3
 */
export async function generateIDMLExport(input: ExportInput): Promise<string> {
  const theme = BOOK_THEMES[input.themeId] || BOOK_THEMES["classic-fiction"];
  const trimSize = TRIM_SIZES[input.trimSizeKey] || TRIM_SIZES["6x9"];
  
  const options: IDMLGenerationOptions = {
    theme,
    trimSize,
    documentTitle: input.title
  };
  
  // Generate IDML file structure
  const files = generateIDMLStructure(input.chapters, options);
  
  // Create zip archive
  const archive = archiver("zip", {
    zlib: { level: 9 }
  });
  
  const chunks: Buffer[] = [];
  
  return new Promise((resolve, reject) => {
    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      
      // Upload to S3
      const fileKey = `${input.userId}/exports/${nanoid()}-${sanitizeFilename(input.title)}.idml`;
      const { url } = await storagePut(fileKey, buffer, "application/vnd.adobe.indesign-idml-package");
      
      resolve(url);
    });
    archive.on("error", reject);
    
    // Add files to archive
    // mimetype must be first and stored (not compressed)
    archive.append(files.get("mimetype")!, { name: "mimetype", store: true });
    
    // Add all other files
    files.forEach((content, path) => {
      if (path !== "mimetype") {
        archive.append(content, { name: path });
      }
    });
    
    archive.finalize();
  });
}

/**
 * Generate HTML for PDF conversion and upload to S3
 * Note: Actual PDF generation would require a headless browser or PDF library
 */
export async function generatePDFExport(input: ExportInput): Promise<{ htmlUrl: string; pdfUrl?: string }> {
  const theme = BOOK_THEMES[input.themeId] || BOOK_THEMES["classic-fiction"];
  const trimSize = TRIM_SIZES[input.trimSizeKey] || TRIM_SIZES["6x9"];
  
  const options: PDFGenerationOptions = {
    theme,
    trimSize,
    includeBleed: true,
    bleedSize: 0.125
  };
  
  // Generate HTML content
  const html = generateBookHtml(input.chapters, input.copyrightPage, options);
  
  // Upload HTML to S3
  const htmlKey = `${input.userId}/exports/${nanoid()}-${sanitizeFilename(input.title)}.html`;
  const { url: htmlUrl } = await storagePut(htmlKey, Buffer.from(html), "text/html");
  
  // Note: For production, you would use a service like Puppeteer, Prince XML, or WeasyPrint
  // to convert the HTML to PDF. For now, we return the HTML which can be printed to PDF.
  
  return { htmlUrl };
}

/**
 * Generate both IDML and PDF exports
 */
export async function generateFullExport(input: ExportInput): Promise<ExportResult> {
  const results: ExportResult = {};
  
  // Generate IDML
  try {
    results.idmlUrl = await generateIDMLExport(input);
  } catch (error) {
    console.error("IDML generation failed:", error);
  }
  
  // Generate PDF/HTML
  try {
    const pdfResult = await generatePDFExport(input);
    results.htmlUrl = pdfResult.htmlUrl;
    results.pdfUrl = pdfResult.pdfUrl;
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
  
  return results;
}

/**
 * Sanitize filename for safe storage
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}
