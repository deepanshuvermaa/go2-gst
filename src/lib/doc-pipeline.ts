/**
 * Go2GST Document Processing Pipeline
 * Orchestrates: Ingest → OCR → Classify → Extract → Validate → Index → Save
 * Each stage emits events for the workflow engine
 */

import { type IngestedDocument, ingestionEvents } from "./doc-ingest";
import { extractText, preprocessImage, cleanOCRText, detectLanguage } from "./doc-ocr";
import { classifyDocument, type ClassificationResult } from "./doc-classify";
import { searchIndex } from "./doc-search";
import { executeWorkflows, type WorkflowContext } from "./doc-workflow";
import { validateGSTIN, crossCheckAmounts } from "./validate";

export interface ProcessedDocument {
  id: string;
  fileName: string;
  source: string;
  ocrText: string;
  ocrConfidence: number;
  language: string;
  classification: ClassificationResult;
  extraction: Record<string, unknown> | null;
  validations: { gstinValid: boolean | null; amountsMatch: boolean | null; warnings: string[] };
  processedAt: Date;
  processingTimeMs: number;
}

export type PipelineStage = "ingest" | "ocr" | "classify" | "extract" | "validate" | "index" | "save";

export interface PipelineProgress {
  documentId: string;
  stage: PipelineStage;
  progress: number; // 0-100
  message: string;
}

type ProgressCallback = (progress: PipelineProgress) => void;

// ─── Main Processing Pipeline ───

export async function processDocument(
  doc: IngestedDocument,
  options: { skipAI?: boolean; languages?: string[]; onProgress?: ProgressCallback } = {}
): Promise<ProcessedDocument> {
  const startTime = Date.now();
  const { skipAI = false, languages = ["english", "hindi"], onProgress } = options;

  const emit = (stage: PipelineStage, progress: number, message: string) => {
    onProgress?.({ documentId: doc.id, stage, progress, message });
  };

  // Stage 1: Preprocess
  emit("ingest", 10, "Preprocessing document...");
  let buffer = doc.rawBuffer;
  if (doc.format === "image") {
    try { buffer = await preprocessImage(buffer); } catch { /* use original */ }
  }

  // Stage 2: OCR
  emit("ocr", 30, "Extracting text...");
  const ocrResult = await extractText({ ...doc, rawBuffer: buffer }, languages);
  const cleanText = cleanOCRText(ocrResult.text);
  const language = detectLanguage(cleanText);

  await executeWorkflows("document:ocr_complete", { documentId: doc.id, text: cleanText });

  // Stage 3: Classify
  emit("classify", 50, "Classifying document...");
  const classification = classifyDocument(cleanText);

  await executeWorkflows("document:classified", {
    documentId: doc.id,
    text: cleanText,
    documentType: classification.documentType,
    category: classification.category,
    vendor: classification.vendor || undefined,
  });

  // Stage 4: AI Extraction (optional — uses Groq)
  emit("extract", 65, skipAI ? "Skipping AI extraction..." : "Extracting GST data with AI...");
  let extraction: Record<string, unknown> | null = null;

  if (!skipAI && cleanText.length > 20) {
    extraction = await callAIExtraction(cleanText);
    if (extraction) {
      await executeWorkflows("document:extracted", {
        documentId: doc.id,
        text: cleanText,
        amount: (extraction.totals as Record<string, unknown>)?.grand_total as number,
        vendor: extraction.seller as { name: string; gstin: string | null },
        category: extraction.suggested_category as string,
        documentType: extraction.document_type as string,
      });
    }
  }

  // Stage 5: Validate
  emit("validate", 80, "Validating data...");
  const validations = validateExtractedData(extraction);

  // Stage 6: Index for search
  emit("index", 90, "Indexing for search...");
  const seller = extraction?.seller as Record<string, unknown> | undefined;
  const totals = extraction?.totals as Record<string, unknown> | undefined;

  searchIndex.add({
    id: doc.id,
    text: cleanText,
    title: doc.fileName,
    vendor: (seller?.name as string) || classification.vendor?.name || "",
    gstin: (seller?.gstin as string) || classification.vendor?.gstin || "",
    category: (extraction?.suggested_category as string) || classification.category,
    documentType: classification.documentType,
    amount: (totals?.grand_total as number) || 0,
    date: (extraction?.invoice_date as string) || new Date().toISOString().split("T")[0],
    tags: classification.suggestedTags,
  });

  emit("save", 100, "Complete");

  return {
    id: doc.id,
    fileName: doc.fileName,
    source: doc.source,
    ocrText: cleanText,
    ocrConfidence: ocrResult.confidence,
    language,
    classification,
    extraction,
    validations,
    processedAt: new Date(),
    processingTimeMs: Date.now() - startTime,
  };
}

// ─── AI Extraction (text-based, not vision — much cheaper) ───

async function callAIExtraction(text: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // text model — 1000 RPD free
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: `Extract GST data from this document text:\n\n${text.slice(0, 6000)}` },
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function validateExtractedData(data: Record<string, unknown> | null) {
  const warnings: string[] = [];
  let gstinValid: boolean | null = null;
  let amountsMatch: boolean | null = null;

  if (!data) return { gstinValid, amountsMatch, warnings };

  const seller = data.seller as Record<string, unknown> | undefined;
  if (seller?.gstin) {
    const result = validateGSTIN(seller.gstin as string);
    gstinValid = result.valid;
    if (!result.valid) warnings.push("Seller GSTIN checksum failed");
  }

  const items = (data.line_items || []) as Array<Record<string, unknown>>;
  const totals = data.totals as Record<string, unknown> | undefined;
  if (items.length > 0 && totals?.grand_total) {
    const check = crossCheckAmounts(
      items.map((i) => ({ taxable_value: i.taxable_value as number, cgst_amount: i.cgst_amount as number, sgst_amount: i.sgst_amount as number, igst_amount: i.igst_amount as number, cess_amount: i.cess_amount as number })),
      totals.grand_total as number
    );
    amountsMatch = check.matches;
    if (!check.matches) warnings.push("Calculated total doesn't match printed total");
  }

  return { gstinValid, amountsMatch, warnings };
}

// ─── Auto-start pipeline on ingestion events ───

export function startPipelineListener() {
  ingestionEvents.on("document:ingested", async (doc: IngestedDocument) => {
    await processDocument(doc);
  });
}

const EXTRACTION_PROMPT = `You are an Indian accounting AI. Extract GST data from the OCR text. Return ONLY valid JSON with: document_type, confidence, seller{name,gstin,state,state_code}, buyer{name,gstin,state_code}, invoice_number, invoice_date, financial_year, supply_type, line_items[{description,hsn_code,sac_code,quantity,unit_price,taxable_value,gst_rate_percent,cgst_amount,sgst_amount,igst_amount}], totals{subtotal,total_cgst,total_sgst,total_igst,grand_total}, itc{eligible,type,blocked_reason}, suggested_category, transaction_direction. If a field is not found, use null.`;
