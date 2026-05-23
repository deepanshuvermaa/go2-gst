import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_PROMPT = `You are an expert Indian accounting AI. Extract every financially and legally relevant field from the provided Indian business document image.

OUTPUT RULES:
1. Respond ONLY with valid JSON. No markdown, no commentary.
2. If a field is not present, output null.
3. Monetary amounts must be numbers (float), no ₹ symbol or commas.
4. Dates in ISO 8601: "YYYY-MM-DD".
5. GSTIN is exactly 15 characters. Validate format before outputting.
6. HSN codes are 4/6/8 digits. SAC codes are 6 digits starting with 99.
7. For intra-state: CGST + SGST. For inter-state: IGST only. Never both.
8. Recalculate totals from line items. Set amounts_match_check true if within ±1 INR.
9. If document is in any Indian language, extract fields in English.
10. confidence: 0.0–1.0. Deduct 0.1 per missing critical field.

OUTPUT JSON SCHEMA:
{
  "document_type": "tax_invoice"|"bill_of_supply"|"credit_note"|"debit_note"|"receipt"|"upi_screenshot"|"unknown",
  "confidence": float,
  "amounts_match_check": boolean,
  "extraction_warnings": string[],
  "seller": { "name": string|null, "gstin": string|null, "gstin_valid": boolean|null, "pan": string|null, "address": string|null, "city": string|null, "state": string|null, "state_code": string|null, "phone": string|null },
  "buyer": { "name": string|null, "gstin": string|null, "gstin_valid": boolean|null, "state": string|null, "state_code": string|null },
  "invoice_number": string|null,
  "invoice_date": string|null,
  "financial_year": string|null,
  "place_of_supply": string|null,
  "place_of_supply_code": string|null,
  "supply_type": "intra_state"|"inter_state"|"export"|null,
  "reverse_charge": boolean,
  "irn": string|null,
  "ewb_number": string|null,
  "line_items": [{ "sl_no": number|null, "description": string|null, "hsn_code": string|null, "sac_code": string|null, "product_type": "goods"|"services"|null, "quantity": float|null, "unit": string|null, "unit_price": float|null, "discount_amount": float|null, "taxable_value": float|null, "gst_rate_percent": float|null, "cgst_amount": float|null, "sgst_amount": float|null, "igst_amount": float|null, "cess_amount": float|null, "line_total": float|null }],
  "totals": { "subtotal": float|null, "total_discount": float|null, "total_cgst": float|null, "total_sgst": float|null, "total_igst": float|null, "total_cess": float|null, "total_tax": float|null, "round_off": float|null, "grand_total": float|null },
  "payment": { "bank_name": string|null, "ifsc": string|null, "upi_id": string|null, "payment_mode": string|null },
  "tds": { "applicable": boolean, "section": string|null, "amount": float|null },
  "itc": { "eligible": boolean|null, "blocked_reason": string|null, "type": string|null },
  "suggested_category": string|null,
  "transaction_direction": "income"|"expense"
}`;

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all GST-relevant data from this document." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "AI extraction failed", details: err }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    // Parse the JSON from AI response
    const extracted = JSON.parse(content);

    return NextResponse.json({ success: true, data: extracted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Extraction failed", details: message }, { status: 500 });
  }
}
