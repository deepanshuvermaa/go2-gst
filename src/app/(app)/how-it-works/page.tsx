"use client";

import Link from "next/link";

const FEATURES = [
  {
    id: "scan",
    title: "Scan & Extract",
    subtitle: "Photo → Structured Data in 3 seconds",
    description: "Upload or photograph any Indian invoice, receipt, or bill. Our AI engine runs OCR (supports English, Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati), then extracts every GST-relevant field automatically.",
    steps: ["Upload photo/PDF or forward email", "OCR extracts text (free, instant)", "AI identifies GSTIN, HSN, amounts, tax splits", "Validates GSTIN checksum, cross-checks totals", "Saves structured data to your account"],
    output: "Seller name, GSTIN (validated), invoice number, date, line items with HSN/SAC codes, CGST/SGST/IGST splits, grand total, ITC eligibility",
  },
  {
    id: "validate",
    title: "Auto Validation",
    subtitle: "Every field verified before saving",
    description: "No more wrong GSTINs or mismatched amounts. Every extracted document goes through our validation pipeline.",
    steps: ["GSTIN checksum (Verhoeff algorithm) — catches typos", "PAN format verification", "IFSC code validation with bank lookup", "Amount cross-check (line items vs printed total ±₹1)", "HSN/SAC rate validation against official rates"],
    output: "Confidence score, validation status per field, warnings for mismatches",
  },
  {
    id: "classify",
    title: "Smart Classification",
    subtitle: "Auto-categorize with ML that learns from you",
    description: "Documents are automatically classified by type (invoice, receipt, credit note, bank statement) and category (office supplies, travel, software). The system learns from your corrections.",
    steps: ["Pattern matching detects document type", "Vendor identified by GSTIN or name patterns", "Category assigned from 14+ business categories", "You correct → system learns → accuracy improves", "Recurring vendors auto-detected (monthly/quarterly)"],
    output: "Document type, vendor match, category, suggested tags, recurring vendor flag",
  },
  {
    id: "gstr",
    title: "GSTR-1 & 3B Export",
    subtitle: "One-click JSON for GST portal upload",
    description: "All your transactions are automatically classified into B2B, B2C Small, B2C Large, Credit Notes, and HSN Summary tables. Download the JSON file and upload directly to the GST portal.",
    steps: ["Transactions auto-classified (B2B if buyer has GSTIN, B2CL if >₹2.5L interstate, B2CS otherwise)", "HSN summary aggregated by code with quantities and tax", "GSTR-3B computed: Output Tax − ITC = Net Payable", "Download as GSTN Offline Tool v1.7 JSON", "Upload to gst.gov.in → done"],
    output: "GSTR-1 JSON (B2B, B2CS, B2CL, CDNR, HSN tables), GSTR-3B summary (3.1, 4A, 4B, 5)",
  },
  {
    id: "itc",
    title: "ITC Tracking",
    subtitle: "Never miss a claimable credit",
    description: "Every bill is checked against Section 17(5) blocked categories. Eligible ITC is tracked separately so you know exactly how much you can claim.",
    steps: ["Check if vendor has valid GSTIN (no GSTIN = no ITC)", "Check blocked categories (motor vehicles, food, club membership, etc.)", "Classify ITC type: inputs, capital goods, or input services", "Track monthly ITC available vs reversed", "Flag when ITC exceeds output tax (refund opportunity)"],
    output: "ITC eligible/blocked per bill, blocked reason, monthly ITC summary, refund alerts",
  },
  {
    id: "tds",
    title: "TDS/TCS Detection",
    subtitle: "Auto-detect applicable sections and compute",
    description: "Based on the payment category and amount, the system identifies which TDS section applies (194C, 194J, 194H, 194I, 194Q, 195) and computes the deduction.",
    steps: ["Detect category from bill (professional services → 194J, rent → 194I, etc.)", "Check annual threshold (e.g., ₹30K for 194C)", "Apply rate based on PAN availability (with PAN vs without)", "Compute TDS amount and net payable", "Track cumulative TDS for Form 26AS reconciliation"],
    output: "Applicable section, rate, TDS amount, net payable, annual cumulative tracker",
  },
  {
    id: "invoice",
    title: "Create Invoices",
    subtitle: "Generate GST-compliant invoices with one form",
    description: "Not just scanning — create professional tax invoices with proper CGST/SGST/IGST splits, HSN codes, amount in words, and bank details. Print or share as PDF.",
    steps: ["Fill buyer details (auto-complete from vendor directory)", "Add line items with HSN code (auto-suggest from database)", "System calculates tax based on supply type (intra/inter state)", "Generates amount in words (Indian format)", "Download as printable HTML/PDF with your branding"],
    output: "Professional invoice with all mandatory GST fields, PDF/print ready",
  },
  {
    id: "bank",
    title: "Bank Statement Parsing",
    subtitle: "Upload PDF → categorized transactions",
    description: "Upload your bank statement PDF. The parser detects your bank, extracts every transaction, and auto-categorizes them (UPI payments, NEFT transfers, EMIs, utilities, subscriptions).",
    steps: ["Upload bank statement PDF/CSV", "Auto-detect bank (HDFC, ICICI, SBI, Axis, etc.)", "Parse date, description, debit/credit, balance", "Auto-categorize with 20+ patterns (UPI, NEFT, EMI, utilities)", "Match with scanned invoices for reconciliation"],
    output: "Parsed transactions with categories, monthly summary, reconciliation matches",
  },
  {
    id: "itr",
    title: "ITR Calculator",
    subtitle: "Old vs New regime — see which saves more",
    description: "Enter your income details and deductions. Instantly compare tax liability under old and new regime (AY 2026-27 slabs). Get quarterly advance tax schedule.",
    steps: ["Enter salary, business income, other income", "Add deductions (80C, 80D, HRA, home loan, NPS)", "System computes tax under both regimes", "Shows recommended regime with savings amount", "Generates advance tax quarterly schedule (Jun/Sep/Dec/Mar)"],
    output: "Side-by-side comparison, recommended regime, advance tax installments with due dates",
  },
  {
    id: "ca",
    title: "CA Portal",
    subtitle: "Manage all clients from one dashboard",
    description: "For Chartered Accountants: invite clients, see all their bills in one place, bulk review/approve, and export GSTR for each client with one click.",
    steps: ["Create organization → get invite link", "Clients sign up under your organization", "See all client bills, expenses, ITC in one view", "Bulk approve/reject/flag transactions", "One-click GSTR-1/3B export per client per month"],
    output: "Multi-client dashboard, per-client summary, bulk operations, one-click filing",
  },
  {
    id: "telegram",
    title: "Telegram Bot",
    subtitle: "Send photo → get data back in 5 seconds",
    description: "No app needed. Send a bill photo to @Go2GSTBot on Telegram. Get structured extraction reply instantly. All data syncs to your dashboard.",
    steps: ["Open Telegram → find @Go2GSTBot", "Send /start to link your account", "Send any bill photo", "Bot replies with extracted data in 5 seconds", "Data appears in your dashboard automatically"],
    output: "Formatted reply with seller, GSTIN, amount, GST, ITC status, category",
  },
  {
    id: "tally",
    title: "Tally Export",
    subtitle: "XML import for Tally ERP users",
    description: "For businesses still using Tally: export all your transactions as Tally-compatible XML. Import directly into Tally without manual data entry.",
    steps: ["Select month/period to export", "System maps categories to Tally ledger names", "Generates proper XML with Dr/Cr entries", "Includes GST ledgers (CGST Input, SGST Output, etc.)", "Import into Tally → all vouchers created automatically"],
    output: "Tally XML file with purchase/sales vouchers, GST ledger entries, party names",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[var(--font-heading)] text-[24px] font-semibold text-[#1a1a2e]">How It Works</h1>
        <p className="text-[14px] text-[#4a5568] mt-2 max-w-[560px]">
          A complete walkthrough of every feature in Go2GST — from scanning your first bill to filing your GST return.
        </p>
      </div>

      {/* Flow overview */}
      <div className="rounded-[14px] bg-[#eef2fb] border border-[#d6e4ff] p-6">
        <p className="text-[12px] font-medium text-[#3b5bdb] uppercase tracking-[0.04em] mb-3">The Complete Flow</p>
        <div className="flex flex-wrap items-center gap-2">
          {["Upload/Email/Telegram", "→", "OCR (free)", "→", "AI Extract", "→", "Validate", "→", "Classify", "→", "Save", "→", "Export GSTR"].map((s, i) => (
            s === "→" ? <span key={i} className="text-[#94a3b8] text-[14px]">→</span> :
            <span key={i} className="px-3 py-1.5 rounded-[8px] bg-[#fcfcfc] border border-[#d6e4ff] text-[12px] font-medium text-[#1a1a2e]">{s}</span>
          ))}
        </div>
      </div>

      {/* Feature sections */}
      <div className="space-y-6">
        {FEATURES.map((feature, idx) => (
          <div key={feature.id} className="rounded-[14px] border border-[#e2e8f0] overflow-hidden hover:border-[#d6e4ff] transition-colors">
            <div className="px-6 py-4 bg-[#fcfcfc] border-b border-[#e2e8f0] flex items-center gap-3">
              <span className="w-7 h-7 rounded-[8px] bg-[#3b5bdb] text-white text-[12px] font-semibold inline-flex items-center justify-center">{idx + 1}</span>
              <div>
                <h2 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e]">{feature.title}</h2>
                <p className="text-[12px] text-[#94a3b8]">{feature.subtitle}</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-[13px] text-[#4a5568] leading-[1.6]">{feature.description}</p>

              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-[0.04em]">How it works</p>
                {feature.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#eef2fb] text-[#3b5bdb] text-[10px] font-semibold inline-flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-[13px] text-[#1a1a2e]">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[10px] bg-[#eef2fb] border border-[#d6e4ff] p-3">
                <p className="text-[11px] font-medium text-[#3b5bdb] mb-1">Output</p>
                <p className="text-[12px] text-[#4a5568] leading-[1.5]">{feature.output}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-[14px] bg-[#eef2fb] border border-[#d6e4ff] p-8 text-center">
        <h2 className="font-[var(--font-heading)] text-[20px] font-semibold text-[#1a1a2e]">Ready to start?</h2>
        <p className="text-[14px] text-[#4a5568] mt-2">Scan your first bill and see the magic in action.</p>
        <Link href="/scan" className="inline-flex items-center h-[44px] px-6 bg-[#3b5bdb] text-white text-[14px] font-medium rounded-[10px] mt-5 hover:bg-[#4c6ef5] transition-colors">
          Scan Your First Bill →
        </Link>
      </div>
    </div>
  );
}
