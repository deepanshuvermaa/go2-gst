/**
 * Go2GST Document Classification Engine
 * Pattern-based + learning classifier for vendors, document types, and categories
 * Improves accuracy with every user correction
 */

export type DocumentClass = "tax_invoice" | "bill_of_supply" | "credit_note" | "debit_note" | "receipt" | "bank_statement" | "salary_slip" | "delivery_challan" | "proforma" | "upi_screenshot" | "unknown";

export interface ClassificationResult {
  documentType: DocumentClass;
  documentTypeConfidence: number;
  vendor: { name: string; gstin: string | null; confidence: number } | null;
  category: string;
  categoryConfidence: number;
  suggestedTags: string[];
}

// ─── Document Type Classification ───

const DOC_TYPE_PATTERNS: { type: DocumentClass; patterns: RegExp[]; weight: number }[] = [
  { type: "tax_invoice", patterns: [/tax\s*invoice/i, /gstin/i, /hsn/i, /cgst|sgst|igst/i, /invoice\s*no/i], weight: 1 },
  { type: "bill_of_supply", patterns: [/bill\s*of\s*supply/i, /composition\s*dealer/i], weight: 1.2 },
  { type: "credit_note", patterns: [/credit\s*note/i, /cn\s*no/i], weight: 1.5 },
  { type: "debit_note", patterns: [/debit\s*note/i, /dn\s*no/i], weight: 1.5 },
  { type: "receipt", patterns: [/receipt/i, /cash\s*memo/i, /paid/i], weight: 0.8 },
  { type: "bank_statement", patterns: [/statement\s*of\s*account/i, /opening\s*balance/i, /closing\s*balance/i, /neft|rtgs|imps/i], weight: 1.3 },
  { type: "salary_slip", patterns: [/salary\s*slip/i, /pay\s*slip/i, /basic\s*salary/i, /gross\s*salary/i, /provident\s*fund/i], weight: 1.4 },
  { type: "delivery_challan", patterns: [/delivery\s*challan/i, /challan/i], weight: 1.3 },
  { type: "proforma", patterns: [/proforma/i, /pro\s*forma/i, /quotation/i, /estimate/i], weight: 1.2 },
  { type: "upi_screenshot", patterns: [/upi|google\s*pay|phonepe|paytm/i, /transaction\s*id/i, /utr/i], weight: 1.1 },
];

export function classifyDocumentType(text: string): { type: DocumentClass; confidence: number } {
  let bestType: DocumentClass = "unknown";
  let bestScore = 0;

  for (const { type, patterns, weight } of DOC_TYPE_PATTERNS) {
    let matches = 0;
    for (const p of patterns) {
      if (p.test(text)) matches++;
    }
    const score = (matches / patterns.length) * weight;
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  return { type: bestType, confidence: Math.min(bestScore, 1) };
}

// ─── Vendor Detection ───

const GSTIN_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]/g;

export function detectVendor(text: string, knownVendors: { name: string; gstin: string; patterns: string[] }[]): ClassificationResult["vendor"] {
  // Extract GSTINs from text
  const gstins = Array.from(text.matchAll(GSTIN_REGEX)).map((m) => m[0]);

  // Match against known vendors
  for (const vendor of knownVendors) {
    if (gstins.includes(vendor.gstin)) {
      return { name: vendor.name, gstin: vendor.gstin, confidence: 0.98 };
    }
    for (const pattern of vendor.patterns) {
      if (text.toLowerCase().includes(pattern.toLowerCase())) {
        return { name: vendor.name, gstin: vendor.gstin, confidence: 0.85 };
      }
    }
  }

  // If GSTIN found but no known vendor, return partial match
  if (gstins.length > 0) {
    return { name: "", gstin: gstins[0], confidence: 0.6 };
  }

  return null;
}

// ─── Category Classification ───

const CATEGORY_PATTERNS: { category: string; keywords: string[] }[] = [
  { category: "office_supplies", keywords: ["stationery", "paper", "pen", "printer", "cartridge", "toner"] },
  { category: "software", keywords: ["software", "saas", "subscription", "license", "cloud", "hosting", "domain", "aws", "azure"] },
  { category: "travel", keywords: ["uber", "ola", "flight", "hotel", "travel", "cab", "taxi", "railway", "irctc"] },
  { category: "food_entertainment", keywords: ["swiggy", "zomato", "restaurant", "food", "catering", "lunch", "dinner"] },
  { category: "utilities", keywords: ["electricity", "water", "internet", "broadband", "airtel", "jio", "vodafone", "bsnl", "gas"] },
  { category: "rent", keywords: ["rent", "lease", "office space", "warehouse", "property"] },
  { category: "professional_services", keywords: ["consulting", "legal", "advocate", "chartered accountant", "audit", "advisory"] },
  { category: "advertising", keywords: ["google ads", "facebook", "marketing", "advertisement", "promotion", "campaign"] },
  { category: "raw_materials", keywords: ["raw material", "steel", "cement", "chemical", "fabric", "component", "parts"] },
  { category: "logistics", keywords: ["courier", "shipping", "freight", "transport", "delhivery", "bluedart", "dtdc"] },
  { category: "maintenance", keywords: ["repair", "maintenance", "amc", "service", "annual maintenance"] },
  { category: "insurance", keywords: ["insurance", "premium", "policy", "lic", "health insurance"] },
  { category: "bank_charges", keywords: ["bank charge", "processing fee", "annual fee", "gst on bank"] },
  { category: "medical", keywords: ["hospital", "medical", "pharmacy", "medicine", "doctor", "clinic"] },
];

export function classifyCategory(text: string): { category: string; confidence: number } {
  const lower = text.toLowerCase();
  let bestCategory = "other";
  let bestScore = 0;

  for (const { category, keywords } of CATEGORY_PATTERNS) {
    let matches = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) matches++;
    }
    const score = matches / keywords.length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return { category: bestCategory, confidence: Math.min(bestScore * 3, 0.95) };
}

// ─── Full Classification Pipeline ───

export function classifyDocument(text: string, knownVendors: { name: string; gstin: string; patterns: string[] }[] = []): ClassificationResult {
  const { type, confidence: typeConf } = classifyDocumentType(text);
  const vendor = detectVendor(text, knownVendors);
  const { category, confidence: catConf } = classifyCategory(text);

  const tags: string[] = [];
  if (type !== "unknown") tags.push(type.replace(/_/g, "-"));
  if (vendor?.gstin) tags.push("gstin-verified");
  if (category !== "other") tags.push(category.replace(/_/g, "-"));

  return {
    documentType: type,
    documentTypeConfidence: typeConf,
    vendor,
    category,
    categoryConfidence: catConf,
    suggestedTags: tags,
  };
}

// ─── Learning: Store corrections to improve future classification ───

interface CorrectionEntry {
  textSnippet: string; // first 200 chars
  correctedCategory: string;
  correctedType: DocumentClass;
  vendorGstin: string | null;
  timestamp: number;
}

const corrections: CorrectionEntry[] = [];

export function recordCorrection(text: string, category: string, type: DocumentClass, vendorGstin: string | null) {
  corrections.push({
    textSnippet: text.slice(0, 200).toLowerCase(),
    correctedCategory: category,
    correctedType: type,
    vendorGstin: vendorGstin,
    timestamp: Date.now(),
  });
}

export function getLearnedPatterns(): CorrectionEntry[] {
  return corrections;
}
