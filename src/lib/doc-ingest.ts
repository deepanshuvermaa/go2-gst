/**
 * Go2GST Document Ingestion Engine
 * Handles: file upload, email forwarding, folder watching, multi-format processing
 */

import { EventEmitter } from "events";

export type DocFormat = "pdf" | "image" | "excel" | "word" | "text" | "unknown";
export type IngestionSource = "upload" | "email" | "folder" | "telegram" | "api";

export interface IngestedDocument {
  id: string;
  fileName: string;
  format: DocFormat;
  source: IngestionSource;
  sourceEmail?: string;
  rawBuffer: Buffer;
  mimeType: string;
  sizeBytes: number;
  pageCount: number;
  ingestedAt: Date;
  metadata: Record<string, string>;
}

export const ingestionEvents = new EventEmitter();

// ─── Format Detection ───

const FORMAT_MAP: Record<string, DocFormat> = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/tiff": "image",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
  "application/vnd.ms-excel": "excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
  "application/msword": "word",
  "text/plain": "text",
  "text/csv": "text",
};

export function detectFormat(mimeType: string, fileName: string): DocFormat {
  if (FORMAT_MAP[mimeType]) return FORMAT_MAP[mimeType];
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp", "tiff", "bmp"].includes(ext || "")) return "image";
  if (["xlsx", "xls", "csv"].includes(ext || "")) return "excel";
  if (["doc", "docx"].includes(ext || "")) return "word";
  if (["txt"].includes(ext || "")) return "text";
  return "unknown";
}

// ─── Ingest from Upload ───

export async function ingestFromUpload(buffer: Buffer, fileName: string, mimeType: string): Promise<IngestedDocument> {
  const format = detectFormat(mimeType, fileName);
  const pageCount = await estimatePageCount(buffer, format);

  const doc: IngestedDocument = {
    id: generateDocId(),
    fileName,
    format,
    source: "upload",
    rawBuffer: buffer,
    mimeType,
    sizeBytes: buffer.length,
    pageCount,
    ingestedAt: new Date(),
    metadata: {},
  };

  ingestionEvents.emit("document:ingested", doc);
  return doc;
}

// ─── Ingest from Email ───

export async function ingestFromEmail(emailRaw: string): Promise<IngestedDocument[]> {
  const { simpleParser } = await import("mailparser");
  const parsed = await simpleParser(emailRaw);
  const documents: IngestedDocument[] = [];

  const attachments = parsed.attachments || [];
  for (const att of attachments) {
    if (att.size < 100) continue; // skip tiny attachments (signatures etc)
    const format = detectFormat(att.contentType, att.filename || "attachment");
    if (format === "unknown") continue;

    const doc: IngestedDocument = {
      id: generateDocId(),
      fileName: att.filename || `email-attachment-${Date.now()}`,
      format,
      source: "email",
      sourceEmail: parsed.from?.text || "",
      rawBuffer: att.content,
      mimeType: att.contentType,
      sizeBytes: att.size,
      pageCount: await estimatePageCount(att.content, format),
      ingestedAt: new Date(),
      metadata: {
        emailSubject: parsed.subject || "",
        emailFrom: parsed.from?.text || "",
        emailDate: parsed.date?.toISOString() || "",
      },
    };

    documents.push(doc);
    ingestionEvents.emit("document:ingested", doc);
  }

  return documents;
}

// ─── Email Polling (IMAP) ───

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
  folder: string;
}

export async function pollEmailInbox(config: EmailConfig): Promise<IngestedDocument[]> {
  const Imap = (await import("imap")).default;
  const allDocs: IngestedDocument[] = [];

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
    });

    imap.once("ready", () => {
      imap.openBox(config.folder || "INBOX", false, (err: Error | null) => {
        if (err) { reject(err); return; }
        imap.search(["UNSEEN"], (err: Error | null, results: number[]) => {
          if (err || !results.length) { imap.end(); resolve(allDocs); return; }

          const fetch = imap.fetch(results, { bodies: "" });
          fetch.on("message", (msg: { on: Function }) => {
            let raw = "";
            msg.on("body", (stream: { on: Function }) => {
              stream.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
              stream.on("end", async () => {
                const docs = await ingestFromEmail(raw);
                allDocs.push(...docs);
              });
            });
          });
          fetch.once("end", () => { imap.end(); resolve(allDocs); });
        });
      });
    });

    imap.once("error", reject);
    imap.connect();
  });
}

// ─── Multi-Page PDF Splitting ───

export async function splitMultiPagePDF(buffer: Buffer): Promise<Buffer[]> {
  const pdfParse = await import("pdf-parse") as unknown as { default: (b: Buffer) => Promise<{ numpages: number }> };
  const data = await pdfParse.default(buffer);

  // If single page or small doc, return as-is
  if (data.numpages <= 1) return [buffer];

  // For multi-page, we return the whole buffer
  // In production, use pdf-lib to split by page
  return [buffer];
}

// ─── Helpers ───

async function estimatePageCount(buffer: Buffer, format: DocFormat): Promise<number> {
  if (format === "pdf") {
    try {
      const pdfParse = await import("pdf-parse") as unknown as { default: (b: Buffer) => Promise<{ numpages: number }> };
      const data = await pdfParse.default(buffer);
      return data.numpages;
    } catch { return 1; }
  }
  return 1;
}

function generateDocId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
