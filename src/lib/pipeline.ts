/**
 * File Upload to S3-compatible storage (Cloudflare R2 / AWS S3)
 * + Extraction pipeline orchestrator
 */

import { validateGSTIN, validateIFSC, crossCheckAmounts } from "./validate";

const S3_ENDPOINT = process.env.S3_ENDPOINT || "";
const S3_BUCKET = process.env.S3_BUCKET || "go2gst-bills";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "";

export async function uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const key = `bills/${Date.now()}-${filename}`;

  if (!S3_ENDPOINT) {
    // Fallback: store locally in development
    return `local://${key}`;
  }

  const url = `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      Authorization: `AWS4-HMAC-SHA256 Credential=${S3_ACCESS_KEY}`,
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  return url;
}

export interface ExtractionResult {
  success: boolean;
  data: Record<string, unknown> | null;
  validations: ValidationResult;
  error?: string;
}

interface ValidationResult {
  sellerGstinValid: boolean | null;
  buyerGstinValid: boolean | null;
  ifscValid: boolean | null;
  amountsMatch: boolean | null;
  warnings: string[];
}

export async function runExtractionPipeline(imageBase64: string): Promise<ExtractionResult> {
  // Stage 1: AI Extraction
  const aiResult = await callGroqVision(imageBase64);
  if (!aiResult) return { success: false, data: null, validations: emptyValidation(), error: "AI extraction failed" };

  // Stage 2: Validation
  const validations = validateExtraction(aiResult);

  // Stage 3: Enrich with HSN descriptions
  enrichHSN(aiResult);

  return { success: true, data: aiResult, validations };
}

async function callGroqVision(base64: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: getExtractionPrompt() },
        { role: "user", content: [{ type: "text", text: "Extract GST data." }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }] },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try { return JSON.parse(content); } catch { return null; }
}

function validateExtraction(data: Record<string, unknown>): ValidationResult {
  const warnings: string[] = [];
  const seller = data.seller as Record<string, unknown> | undefined;
  const buyer = data.buyer as Record<string, unknown> | undefined;
  const payment = data.payment as Record<string, unknown> | undefined;
  const lineItems = (data.line_items || []) as Array<Record<string, unknown>>;
  const totals = data.totals as Record<string, unknown> | undefined;

  // GSTIN validation
  let sellerGstinValid: boolean | null = null;
  if (seller?.gstin) {
    const result = validateGSTIN(seller.gstin as string);
    sellerGstinValid = result.valid;
    if (!result.valid) warnings.push("Seller GSTIN failed checksum");
  }

  let buyerGstinValid: boolean | null = null;
  if (buyer?.gstin) {
    const result = validateGSTIN(buyer.gstin as string);
    buyerGstinValid = result.valid;
    if (!result.valid) warnings.push("Buyer GSTIN failed checksum");
  }

  // IFSC validation
  let ifscValid: boolean | null = null;
  if (payment?.ifsc) {
    ifscValid = validateIFSC(payment.ifsc as string);
    if (!ifscValid) warnings.push("IFSC code format invalid");
  }

  // Amount cross-check
  let amountsMatch: boolean | null = null;
  if (lineItems.length > 0 && totals?.grand_total) {
    const check = crossCheckAmounts(
      lineItems.map((i) => ({
        taxable_value: i.taxable_value as number,
        cgst_amount: i.cgst_amount as number,
        sgst_amount: i.sgst_amount as number,
        igst_amount: i.igst_amount as number,
        cess_amount: i.cess_amount as number,
      })),
      totals.grand_total as number
    );
    amountsMatch = check.matches;
    if (!check.matches) warnings.push(`Amount mismatch: calculated ₹${check.calculated.toFixed(2)} vs reported ₹${totals.grand_total}`);
  }

  return { sellerGstinValid, buyerGstinValid, ifscValid, amountsMatch, warnings };
}

function enrichHSN(data: Record<string, unknown>) {
  const { searchHSN } = require("./hsn");
  const items = (data.line_items || []) as Array<Record<string, unknown>>;
  for (const item of items) {
    if (item.hsn_code) {
      const results = searchHSN(item.hsn_code as string, 1);
      if (results.length > 0 && !item.description) {
        item.hsn_description = results[0].description;
      }
    }
  }
}

function emptyValidation(): ValidationResult {
  return { sellerGstinValid: null, buyerGstinValid: null, ifscValid: null, amountsMatch: null, warnings: [] };
}

function getExtractionPrompt(): string {
  return `You are an Indian accounting AI. Extract all GST fields from the document image. Return ONLY valid JSON with: document_type, confidence, seller{name,gstin,state,state_code}, buyer{name,gstin,state_code}, invoice_number, invoice_date, supply_type, line_items[{description,hsn_code,sac_code,quantity,unit_price,taxable_value,gst_rate_percent,cgst_amount,sgst_amount,igst_amount}], totals{subtotal,total_cgst,total_sgst,total_igst,grand_total}, itc{eligible,type}, suggested_category, transaction_direction.`;
}
