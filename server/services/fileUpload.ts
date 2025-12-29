import { storagePut } from "../storage";
import { parseDocx, generateStyleMappings, ParsedDocument } from "./docxParser";
import { nanoid } from "nanoid";

export interface UploadResult {
  fileUrl: string;
  fileKey: string;
  fileName: string;
  parsedDocument: ParsedDocument;
  styleMappings: Array<{
    sourceStyleName: string;
    sourceStyleType: "paragraph" | "character";
    targetStyleName: string;
  }>;
}

/**
 * Process an uploaded DOCX file
 */
export async function processDocxUpload(
  buffer: Buffer,
  fileName: string,
  userId: number
): Promise<UploadResult> {
  // Generate unique file key
  const fileKey = `${userId}/documents/${nanoid()}-${fileName}`;
  
  // Upload to S3
  const { url: fileUrl } = await storagePut(fileKey, buffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  
  // Parse the document
  const parsedDocument = await parseDocx(buffer);
  
  // Generate style mappings
  const styleMappings = generateStyleMappings(parsedDocument.styles);
  
  return {
    fileUrl,
    fileKey,
    fileName,
    parsedDocument,
    styleMappings
  };
}

/**
 * Validate that a file is a valid DOCX
 */
export function validateDocxFile(buffer: Buffer, fileName: string): { valid: boolean; error?: string } {
  // Check file extension
  if (!fileName.toLowerCase().endsWith('.docx') && !fileName.toLowerCase().endsWith('.doc')) {
    return { valid: false, error: "File must be a Word document (.docx or .doc)" };
  }
  
  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return { valid: false, error: "File size must be less than 50MB" };
  }
  
  // Check DOCX magic bytes (PK zip header)
  if (fileName.toLowerCase().endsWith('.docx')) {
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      return { valid: false, error: "Invalid DOCX file format" };
    }
  }
  
  return { valid: true };
}
