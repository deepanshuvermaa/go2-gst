/**
 * Go2GST OCR Engine
 * Tesseract-based text extraction with Indian language support
 * Handles: images, PDFs (rendered to image), preprocessing
 */

import type { IngestedDocument } from "./doc-ingest";

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  wordCount: number;
  processingTimeMs: number;
  blocks: TextBlock[];
}

export interface TextBlock {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

// Supported Indian languages for OCR
const LANGUAGE_MAP: Record<string, string> = {
  english: "eng",
  hindi: "hin",
  tamil: "tam",
  telugu: "tel",
  kannada: "kan",
  marathi: "mar",
  bengali: "ben",
  gujarati: "guj",
  punjabi: "pan",
  malayalam: "mal",
};

export async function extractText(doc: IngestedDocument, languages: string[] = ["english", "hindi"]): Promise<OCRResult> {
  const startTime = Date.now();

  if (doc.format === "text") {
    const text = doc.rawBuffer.toString("utf-8");
    return { text, confidence: 1.0, language: "eng", wordCount: text.split(/\s+/).length, processingTimeMs: 0, blocks: [] };
  }

  if (doc.format === "pdf") {
    return await extractFromPDF(doc.rawBuffer, languages);
  }

  if (doc.format === "image") {
    return await extractFromImage(doc.rawBuffer, languages);
  }

  return { text: "", confidence: 0, language: "", wordCount: 0, processingTimeMs: Date.now() - startTime, blocks: [] };
}

async function extractFromImage(buffer: Buffer, languages: string[]): Promise<OCRResult> {
  const startTime = Date.now();
  const Tesseract = await import("tesseract.js");

  const langCodes = languages.map((l) => LANGUAGE_MAP[l] || l).join("+");

  const worker = await Tesseract.createWorker(langCodes);
  const { data } = await worker.recognize(buffer);
  await worker.terminate();

  const blocks: TextBlock[] = (data.blocks || []).map((b) => ({
    text: b.text,
    confidence: b.confidence / 100,
    bbox: { x: b.bbox.x0, y: b.bbox.y0, width: b.bbox.x1 - b.bbox.x0, height: b.bbox.y1 - b.bbox.y0 },
  }));

  return {
    text: data.text,
    confidence: data.confidence / 100,
    language: langCodes,
    wordCount: data.text.split(/\s+/).filter(Boolean).length,
    processingTimeMs: Date.now() - startTime,
    blocks,
  };
}

async function extractFromPDF(buffer: Buffer, languages: string[]): Promise<OCRResult> {
  const startTime = Date.now();

  // First try native text extraction (for digital PDFs)
  try {
    const pdfParse = await import("pdf-parse") as unknown as { default: (b: Buffer) => Promise<{ text: string; numpages: number }> };
    const data = await pdfParse.default(buffer);

    if (data.text && data.text.trim().length > 50) {
      // PDF has embedded text — no OCR needed
      return {
        text: data.text,
        confidence: 0.95,
        language: "eng",
        wordCount: data.text.split(/\s+/).filter(Boolean).length,
        processingTimeMs: Date.now() - startTime,
        blocks: [],
      };
    }
  } catch { /* fall through to OCR */ }

  // Scanned PDF — convert to image and OCR
  // In production, use pdf-to-img or sharp to render pages
  // For now, attempt OCR on the raw buffer
  try {
    return await extractFromImage(buffer, languages);
  } catch {
    return { text: "", confidence: 0, language: "", wordCount: 0, processingTimeMs: Date.now() - startTime, blocks: [] };
  }
}

// ─── Image Preprocessing for Better OCR ───

export async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;

  return await sharp(buffer)
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: 2000, withoutEnlargement: true })
    .toBuffer();
}

// ─── Text Cleanup ───

export function cleanOCRText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+$/gm, "")
    .trim();
}

// ─── Detect Document Language ───

export function detectLanguage(text: string): string {
  const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
  const tamil = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  const telugu = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  const kannada = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  const bengali = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const gujarati = (text.match(/[\u0A80-\u0AFF]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;

  const scores = { hindi: devanagari, tamil, telugu, kannada, bengali, gujarati, english: latin };
  const max = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return max[1] > 10 ? max[0] : "english";
}
