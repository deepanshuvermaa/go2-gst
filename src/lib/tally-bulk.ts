/**
 * Tally XML Export + Bulk Upload Queue + Recurring Vendor Detection
 */

// ─── Tally XML Export ───

interface TallyVoucher {
  date: string;
  voucherType: "Purchase" | "Sales" | "Payment" | "Receipt";
  partyName: string;
  amount: number;
  ledgerEntries: { ledger: string; amount: number; isDr: boolean }[];
  narration: string;
  invoiceNumber?: string;
  gstin?: string;
}

export function generateTallyXML(vouchers: TallyVoucher[]): string {
  const voucherXML = vouchers.map((v) => {
    const entries = v.ledgerEntries.map((e) => `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${escapeXML(e.ledger)}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>${e.isDr ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
          <AMOUNT>${e.isDr ? -e.amount : e.amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>`).join("");

    return `
    <VOUCHER VCHTYPE="${v.voucherType}" ACTION="Create">
      <DATE>${v.date.replace(/-/g, "")}</DATE>
      <VOUCHERTYPENAME>${v.voucherType}</VOUCHERTYPENAME>
      <PARTYLEDGERNAME>${escapeXML(v.partyName)}</PARTYLEDGERNAME>
      <VOUCHERNUMBER>${v.invoiceNumber || ""}</VOUCHERNUMBER>
      <NARRATION>${escapeXML(v.narration)}</NARRATION>
      <EFFECTIVEDATE>${v.date.replace(/-/g, "")}</EFFECTIVEDATE>${entries}
    </VOUCHER>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">${voucherXML}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

export function transactionToTallyVoucher(txn: {
  invoiceDate: string;
  sellerName: string;
  invoiceNumber: string;
  grandTotal: number;
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  category: string;
  transactionDirection: string;
  sellerGstin?: string;
}): TallyVoucher {
  const isExpense = txn.transactionDirection === "EXPENSE";
  const entries: TallyVoucher["ledgerEntries"] = [];

  if (isExpense) {
    entries.push({ ledger: mapCategoryToLedger(txn.category), amount: txn.subtotal, isDr: true });
    if (txn.totalCgst) entries.push({ ledger: "CGST Input", amount: txn.totalCgst, isDr: true });
    if (txn.totalSgst) entries.push({ ledger: "SGST Input", amount: txn.totalSgst, isDr: true });
    if (txn.totalIgst) entries.push({ ledger: "IGST Input", amount: txn.totalIgst, isDr: true });
    entries.push({ ledger: txn.sellerName || "Sundry Creditors", amount: txn.grandTotal, isDr: false });
  } else {
    entries.push({ ledger: txn.sellerName || "Sundry Debtors", amount: txn.grandTotal, isDr: true });
    entries.push({ ledger: "Sales", amount: txn.subtotal, isDr: false });
    if (txn.totalCgst) entries.push({ ledger: "CGST Output", amount: txn.totalCgst, isDr: false });
    if (txn.totalSgst) entries.push({ ledger: "SGST Output", amount: txn.totalSgst, isDr: false });
    if (txn.totalIgst) entries.push({ ledger: "IGST Output", amount: txn.totalIgst, isDr: false });
  }

  return {
    date: txn.invoiceDate,
    voucherType: isExpense ? "Purchase" : "Sales",
    partyName: txn.sellerName,
    amount: txn.grandTotal,
    ledgerEntries: entries,
    narration: `${txn.invoiceNumber} - ${txn.category}`,
    invoiceNumber: txn.invoiceNumber,
    gstin: txn.sellerGstin,
  };
}

function mapCategoryToLedger(category: string): string {
  const map: Record<string, string> = {
    office_supplies: "Office Expenses", travel: "Travelling Expenses", software: "Computer Expenses",
    professional_services: "Professional Fees", utilities: "Electricity & Water", rent: "Rent",
    raw_materials: "Purchase of Raw Materials", advertising: "Advertisement Expenses",
    food_entertainment: "Staff Welfare", maintenance: "Repairs & Maintenance",
    logistics: "Freight & Cartage", bank_charges: "Bank Charges",
  };
  return map[category] || "General Expenses";
}

function escapeXML(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Bulk Upload Queue ───

export interface QueueJob {
  id: string;
  userId: string;
  fileName: string;
  status: "pending" | "processing" | "done" | "failed";
  result?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
}

const queue: QueueJob[] = [];

export function addToQueue(userId: string, fileName: string): QueueJob {
  const job: QueueJob = { id: crypto.randomUUID(), userId, fileName, status: "pending", createdAt: new Date() };
  queue.push(job);
  return job;
}

export function getQueueStatus(userId: string): QueueJob[] {
  return queue.filter((j) => j.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function processQueue(processFn: (job: QueueJob) => Promise<Record<string, unknown>>): Promise<void> {
  const pending = queue.filter((j) => j.status === "pending");
  for (const job of pending) {
    job.status = "processing";
    try {
      job.result = await processFn(job);
      job.status = "done";
    } catch (e) {
      job.status = "failed";
      job.error = e instanceof Error ? e.message : "Unknown error";
    }
  }
}

// ─── Recurring Vendor Detection ───

export interface RecurringVendor {
  gstin: string;
  name: string;
  frequency: "monthly" | "quarterly" | "irregular";
  avgAmount: number;
  lastCategory: string;
  transactionCount: number;
  months: string[]; // YYYY-MM format
}

export function detectRecurringVendors(
  transactions: { sellerGstin: string | null; sellerName: string | null; invoiceDate: Date | null; grandTotal: number; category: string | null }[]
): RecurringVendor[] {
  const vendorMap = new Map<string, { name: string; amounts: number[]; dates: Date[]; category: string }>();

  for (const t of transactions) {
    if (!t.sellerGstin || !t.invoiceDate) continue;
    if (!vendorMap.has(t.sellerGstin)) {
      vendorMap.set(t.sellerGstin, { name: t.sellerName || "", amounts: [], dates: [], category: t.category || "" });
    }
    const v = vendorMap.get(t.sellerGstin)!;
    v.amounts.push(t.grandTotal);
    v.dates.push(t.invoiceDate);
    if (t.category) v.category = t.category;
  }

  const recurring: RecurringVendor[] = [];

  for (const [gstin, data] of vendorMap) {
    if (data.amounts.length < 3) continue; // Need at least 3 transactions to detect pattern

    const months = [...new Set(data.dates.map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`))].sort();
    const avgAmount = data.amounts.reduce((s, a) => s + a, 0) / data.amounts.length;

    // Determine frequency
    let frequency: RecurringVendor["frequency"] = "irregular";
    if (months.length >= 3) {
      const gaps = [];
      for (let i = 1; i < months.length; i++) {
        const [y1, m1] = months[i - 1].split("-").map(Number);
        const [y2, m2] = months[i].split("-").map(Number);
        gaps.push((y2 - y1) * 12 + (m2 - m1));
      }
      const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
      if (avgGap <= 1.5) frequency = "monthly";
      else if (avgGap <= 4) frequency = "quarterly";
    }

    recurring.push({ gstin, name: data.name, frequency, avgAmount: Math.round(avgAmount), lastCategory: data.category, transactionCount: data.amounts.length, months });
  }

  return recurring.filter((v) => v.frequency !== "irregular").sort((a, b) => b.transactionCount - a.transactionCount);
}
