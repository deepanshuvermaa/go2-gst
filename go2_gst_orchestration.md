# TaxHacker India — Full Orchestration Map
# Where each repo plugs in, what it does, and what calls what

---

## ORCHESTRATION PIPELINE

User uploads document (image / PDF / WhatsApp forward)
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 1: PRE-PROCESSING                            │
│  Source: TaxHacker's existing pipeline              │
│  lib/pdf.ts → GraphicsMagick converts PDF→PNG       │
│  lib/image.ts → normalise, deskew, compress         │
│  Output: base64 image string(s)                     │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 2: LLM EXTRACTION                           │
│  Source: ai/analyze.ts (TaxHacker core)             │
│  Model: claude-sonnet-4-20250514 OR gpt-4o          │
│  Prompt: india_gst_extraction_prompt.md (this file) │
│  Input: base64 image + system prompt                │
│  Output: raw JSON string                            │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 3: VALIDATION LAYER                          │
│  Source: build inline OR use gstin-validator npm pkg│
│                                                     │
│  3a. GSTIN Checksum Validation                      │
│      Repo: github.com/topics/gstin                  │
│      Package: gstin-validator (npm)                 │
│      import { validate } from 'gstin-validator'     │
│      Run on: seller.gstin, buyer.gstin              │
│      Output: sets gstin_valid true/false            │
│                                                     │
│  3b. GSTIN Live Lookup (optional, async)            │
│      Repo: shubham-dube/GST-Verification-API        │
│      Self-host the Flask app OR call the public API │
│      GET /api/gstin/{gstin}                         │
│      Returns: legal_name, registration_date,        │
│               taxpayer_type, state, status          │
│      Use to: auto-fill seller name if OCR failed,   │
│              verify active vs cancelled status      │
│                                                     │
│  3c. IFSC Validation                                │
│      Package: ifsc (npm) — offline bank/branch DB   │
│      import IFSC from 'ifsc'                        │
│      IFSC.validate(ifscCode) → true/false           │
│      IFSC.fetchDetails(ifscCode) → bank, branch,    │
│                                     city, address   │
│                                                     │
│  3d. PAN Format Validation (regex only)             │
│      /^[A-Z]{3}[ABCFGHLJPTF][A-Z][0-9]{4}[A-Z]$/  │
│      Character 4 encodes entity type:               │
│        A=AOP, B=BOI, C=Company, F=Firm,             │
│        G=Govt, H=HUF, L=LocalAuth, J=AJP,          │
│        P=Individual, T=AOP(Trust)                   │
│                                                     │
│  3e. Amount Cross-Check                             │
│      Recalculate: sum(line_items.taxable_value)     │
│                 + sum(all tax amounts)              │
│                 + round_off                         │
│      Compare to grand_total — flag if diff > ₹1    │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 4: HSN/SAC ENRICHMENT                       │
│  Source: ERPNext fixtures (frappe/erpnext)          │
│  File: erpnext/regional/india/setup/hsn_codes.json │
│  (14,000+ HSN codes with descriptions)             │
│                                                     │
│  Also: MCP server for Indian APIs                   │
│  Repo: github.com/topics/gstin (india-mcp)          │
│  Endpoint: GET /hsn/{code} → description, rate      │
│                                                     │
│  Use to: fill in missing descriptions on line items │
│          validate HSN rate matches extracted rate   │
│          flag rate mismatches in extraction_warnings│
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 5: WRITE TO DATABASE                         │
│  Source: TaxHacker's Prisma schema                  │
│  Add these India-specific fields to Transaction:    │
│    seller_gstin, buyer_gstin                        │
│    place_of_supply, supply_type                     │
│    reverse_charge, irn, ewb_number                  │
│    total_cgst, total_sgst, total_igst, total_cess   │
│    tds_section, tds_amount                          │
│    itc_eligible, itc_type                           │
│    financial_year, document_type                    │
│  LineItem table: hsn_code, sac_code, product_type  │
│                  gst_rate_percent, unit (UQC)       │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 6: GSTR REPORT GENERATION                   │
│  Source: IamRamgarhia/Free-GST-Billing-Software     │
│  Study their GSTR-1 / 3B aggregation logic in:     │
│    src/utils/gstr1.js                               │
│    src/utils/gstr3b.js                              │
│                                                     │
│  Port to TypeScript in TaxHacker:                   │
│  lib/reports/gstr1.ts                               │
│    → B2B table (invoices with buyer GSTIN)          │
│    → B2C Large (>₹2.5L interstate, no GSTIN)       │
│    → B2C Small (aggregate by rate)                  │
│    → HSN Summary (qty + value + tax per HSN code)   │
│    → Credit Notes (CDNR / CDNUR tables)             │
│    → Document Summary (Table 13)                    │
│    Output: GSTN offline-tool JSON v1.7              │
│                                                     │
│  lib/reports/gstr3b.ts                              │
│    → Output tax liability (3.1)                     │
│    → ITC available (4A)                             │
│    → ITC reversed (4B)                              │
│    → Net ITC available (4C)                         │
│    → Net tax payable (5)                            │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 7: ITR / ADVANCE TAX LAYER (Phase 2)        │
│  Source: Nootus/OpenTax                             │
│  Clone the tax computation engine from:            │
│    src/tax-engine/slabs.ts (old + new regime)       │
│    src/tax-engine/advance-tax.ts                    │
│                                                     │
│  Feed it: sum of all income transactions            │
│           less: all ITC-eligible expenses           │
│           plus: TDS already deducted (from docs)    │
│                                                     │
│  Output: quarterly advance tax due (15 Jun/Sep/     │
│          Dec/Mar) with WhatsApp reminder trigger    │
└─────────────────────────────────────────────────────┘

---

## NPM PACKAGES TO INSTALL

# GSTIN validation (offline, no API needed)
npm install gstin-validator

# IFSC validation + bank details (offline DB, ~2MB)
npm install ifsc

# Indian number formatting (lakh, crore)
npm install indian-number-format

# For WhatsApp bot channel:
npm install twilio
# OR
npm install @whiskeysockets/baileys   # free, no Twilio cost, AGPL

# PDF bank statement parsing:
npm install pdf-parse                 # already in TaxHacker

---

## PRISMA SCHEMA ADDITIONS
## Append to your existing Transaction model in prisma/schema.prisma

model Transaction {
  # ... existing TaxHacker fields ...

  # India GST fields
  documentType          String?   # tax_invoice | bill_of_supply | credit_note | receipt | upi_screenshot
  financialYear         String?   # "2024-25"
  sellerGstin           String?
  sellerGstinValid      Boolean?
  buyerGstin            String?
  buyerGstinValid       Boolean?
  placeOfSupply         String?
  placeOfSupplyCode     String?
  supplyType            String?   # intra_state | inter_state | export | sez_with_payment | sez_without_payment
  reverseChargeApplicable Boolean @default(false)
  irnNumber             String?   # e-Invoice IRN
  ewbNumber             String?   # e-Way Bill
  totalCgst             Decimal?  @db.Decimal(12,2)
  totalSgst             Decimal?  @db.Decimal(12,2)
  totalIgst             Decimal?  @db.Decimal(12,2)
  totalCess             Decimal?  @db.Decimal(12,2)
  tdsApplicable         Boolean   @default(false)
  tdsSection            String?
  tdsAmount             Decimal?  @db.Decimal(12,2)
  tcsApplicable         Boolean   @default(false)
  tcsSection            String?
  tcsAmount             Decimal?  @db.Decimal(12,2)
  itcEligible           Boolean?
  itcType               String?   # inputs | capital_goods | input_services
  itcBlockedReason      String?
  extractionConfidence  Decimal?  @db.Decimal(3,2)
  amountsMatchCheck     Boolean?
  extractionWarnings    String[]  @default([])

  lineItems             LineItem[]
}

model LineItem {
  id              String      @id @default(cuid())
  transactionId   String
  transaction     Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  slNo            Int?
  description     String?
  hsnCode         String?
  sacCode         String?
  productType     String?     # goods | services
  quantity        Decimal?    @db.Decimal(12,4)
  unit            String?     # UQC code
  unitPrice       Decimal?    @db.Decimal(12,2)
  discountPercent Decimal?    @db.Decimal(5,2)
  discountAmount  Decimal?    @db.Decimal(12,2)
  taxableValue    Decimal?    @db.Decimal(12,2)
  gstRatePercent  Decimal?    @db.Decimal(5,2)
  cgstRate        Decimal?    @db.Decimal(5,2)
  cgstAmount      Decimal?    @db.Decimal(12,2)
  sgstRate        Decimal?    @db.Decimal(5,2)
  sgstAmount      Decimal?    @db.Decimal(12,2)
  igstRate        Decimal?    @db.Decimal(5,2)
  igstAmount      Decimal?    @db.Decimal(12,2)
  cessRate        Decimal?    @db.Decimal(5,2)
  cessAmount      Decimal?    @db.Decimal(12,2)
  lineTotal       Decimal?    @db.Decimal(12,2)
  createdAt       DateTime    @default(now())
}

---

## WHATSAPP BOT WIRING (Stage 0 — before Stage 1)

# Flow:
# 1. User sends photo to WhatsApp number
# 2. Webhook receives media message (Twilio/Meta Cloud API)
# 3. Download the media as buffer
# 4. Run through Stage 1–6 above
# 5. Reply with extracted summary:
#    "✅ Bill saved!
#     Seller: Ramesh Stationery (27XXXXX)
#     Amount: ₹1,240 (incl. 18% GST ₹189)
#     Date: 15 Nov 2024
#     ITC: Eligible ✓
#     Category: Office Supplies
#     Reply EDIT to change category"

# Twilio handler sketch (apps/api/whatsapp/route.ts):

export async function POST(req: Request) {
  const body = await req.formData()
  const mediaUrl = body.get('MediaUrl0') as string
  const from = body.get('From') as string

  if (!mediaUrl) {
    return twimlReply("Please send a photo of your bill or invoice.")
  }

  // Download from Twilio CDN (authenticated)
  const imageBuffer = await fetchTwilioMedia(mediaUrl)
  const base64 = imageBuffer.toString('base64')

  // Run the full pipeline
  const extracted = await analyzeIndianDocument(base64)

  // Save to DB
  const transaction = await saveTransaction(extracted, getUserFromPhone(from))

  // Reply summary
  const msg = formatWhatsAppReply(extracted, transaction.id)
  return twimlReply(msg)
}

---

## GSTR JSON OUTPUT FORMAT (GSTN offline tool v1.7)
## What to generate after Stage 6 for direct portal upload

{
  "version": "GST3.0.4",
  "hash": "hash",
  "gstin": "27AABCU9603R1ZX",
  "fp": "112024",             // filing period: MMYYYY
  "gt": 115049.50,            // grand total of all invoices
  "cur_gt": 115049.50,
  "b2b": [                    // B2B invoices
    {
      "ctin": "07AAACK1234A1Z5",  // buyer GSTIN
      "inv": [
        {
          "inum": "SGE/2024-25/0187",
          "idt": "15-11-2024",
          "val": 115049.50,
          "pos": "07",
          "rchrg": "N",
          "inv_typ": "R",         // R=Regular, SEWP=SEZ with payment, SEWOP=SEZ without
          "itms": [
            {
              "num": 1,
              "itm_det": {
                "txval": 85500.00,
                "rt": 18,
                "iamt": 15390.00,
                "camt": 0,
                "samt": 0,
                "csamt": 0
              }
            }
          ]
        }
      ]
    }
  ],
  "b2cs": [...],    // B2C small — aggregate by state + rate
  "b2cl": [...],    // B2C large — per invoice > ₹2.5L interstate
  "cdnr": [...],    // Credit/debit notes (registered)
  "cdnur": [...],   // Credit/debit notes (unregistered)
  "hsn": {
    "data": [
      {
        "num": 1,
        "hsn_sc": "84137090",
        "desc": "Pumps for liquids",
        "uqc": "NOS",
        "qty": 2,
        "val": 85500.00,
        "txval": 85500.00,
        "iamt": 15390.00,
        "camt": 0,
        "samt": 0,
        "csamt": 0
      }
    ]
  },
  "doc_issue": {          // Document summary table 13
    "doc_det": [
      {
        "doc_num": 1,
        "docs": [
          {
            "num": 1,
            "from": "SGE/2024-25/0001",
            "to": "SGE/2024-25/0187",
            "totnum": 187,
            "cancel": 0,
            "net_issue": 187
          }
        ]
      }
    ]
  }
}
