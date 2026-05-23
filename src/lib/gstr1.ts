/**
 * GSTR-1 JSON Generator — GSTN Offline Tool v1.7 format
 * Classifies transactions into B2B, B2CS, B2CL, CDNR, HSN summary
 */

interface Transaction {
  id: string;
  sellerGstin: string | null;
  buyerGstin: string | null;
  buyerState: string | null;
  buyerStateCode: string | null;
  sellerStateCode: string | null;
  invoiceNumber: string | null;
  invoiceDate: Date | null;
  supplyType: string | null;
  reverseCharge: boolean;
  grandTotal: number;
  subtotal: number;
  totalCgst: number | null;
  totalSgst: number | null;
  totalIgst: number | null;
  totalCess: number | null;
  documentType: string;
  lineItems: LineItem[];
}

interface LineItem {
  hsnCode: string | null;
  sacCode: string | null;
  taxableValue: number;
  gstRatePercent: number;
  cgstAmount: number | null;
  sgstAmount: number | null;
  igstAmount: number | null;
  cessAmount: number | null;
  quantity: number | null;
  unit: string | null;
}

type InvoiceType = "B2B" | "B2CL" | "B2CS" | "CDNR" | "CDNUR";

export function classifyInvoice(txn: Transaction): InvoiceType {
  const isCreditNote = txn.documentType === "CREDIT_NOTE" || txn.documentType === "DEBIT_NOTE";
  if (isCreditNote) {
    return txn.buyerGstin ? "CDNR" : "CDNUR";
  }
  if (txn.buyerGstin) return "B2B";
  const isInterState = txn.supplyType === "INTER_STATE";
  if (isInterState && txn.grandTotal > 250000) return "B2CL";
  return "B2CS";
}

export function generateGSTR1(
  gstin: string,
  filingPeriod: string, // MMYYYY
  transactions: Transaction[]
) {
  const b2b = buildB2B(transactions.filter((t) => classifyInvoice(t) === "B2B"));
  const b2cl = buildB2CL(transactions.filter((t) => classifyInvoice(t) === "B2CL"));
  const b2cs = buildB2CS(transactions.filter((t) => classifyInvoice(t) === "B2CS"));
  const cdnr = buildCDNR(transactions.filter((t) => classifyInvoice(t) === "CDNR"));
  const cdnur = buildCDNUR(transactions.filter((t) => classifyInvoice(t) === "CDNUR"));
  const hsn = buildHSNSummary(transactions);

  const grandTotal = transactions.reduce((s, t) => s + t.grandTotal, 0);

  return {
    gstin,
    fp: filingPeriod,
    version: "GST3.0.4",
    hash: "hash",
    gt: grandTotal,
    cur_gt: grandTotal,
    b2b,
    b2cl,
    b2cs,
    cdnr,
    cdnur,
    hsn,
  };
}

function buildB2B(txns: Transaction[]) {
  const grouped = groupBy(txns, (t) => t.buyerGstin!);
  return Object.entries(grouped).map(([ctin, invoices]) => ({
    ctin,
    inv: invoices.map((t) => ({
      inum: t.invoiceNumber || "",
      idt: formatDate(t.invoiceDate),
      val: t.grandTotal,
      pos: t.buyerStateCode || t.sellerStateCode || "00",
      rchrg: t.reverseCharge ? "Y" : "N",
      inv_typ: "R",
      itms: buildItems(t.lineItems),
    })),
  }));
}

function buildB2CL(txns: Transaction[]) {
  const grouped = groupBy(txns, (t) => t.buyerStateCode || "00");
  return Object.entries(grouped).map(([pos, invoices]) => ({
    pos,
    inv: invoices.map((t) => ({
      inum: t.invoiceNumber || "",
      idt: formatDate(t.invoiceDate),
      val: t.grandTotal,
      itms: buildItems(t.lineItems),
    })),
  }));
}

function buildB2CS(txns: Transaction[]) {
  // Aggregate by state + rate
  const agg: Record<string, { pos: string; rt: number; typ: string; txval: number; iamt: number; camt: number; samt: number; csamt: number }> = {};
  for (const t of txns) {
    for (const item of t.lineItems) {
      const pos = t.buyerStateCode || t.sellerStateCode || "00";
      const rt = item.gstRatePercent || 0;
      const typ = t.supplyType === "INTER_STATE" ? "OE" : "E";
      const key = `${pos}_${rt}_${typ}`;
      if (!agg[key]) agg[key] = { pos, rt, typ, txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 };
      agg[key].txval += item.taxableValue || 0;
      agg[key].iamt += item.igstAmount || 0;
      agg[key].camt += item.cgstAmount || 0;
      agg[key].samt += item.sgstAmount || 0;
      agg[key].csamt += item.cessAmount || 0;
    }
  }
  return Object.values(agg);
}

function buildCDNR(txns: Transaction[]) {
  const grouped = groupBy(txns, (t) => t.buyerGstin!);
  return Object.entries(grouped).map(([ctin, notes]) => ({
    ctin,
    nt: notes.map((t) => ({
      ntty: t.documentType === "CREDIT_NOTE" ? "C" : "D",
      nt_num: t.invoiceNumber || "",
      nt_dt: formatDate(t.invoiceDate),
      val: t.grandTotal,
      pos: t.buyerStateCode || "00",
      rchrg: t.reverseCharge ? "Y" : "N",
      inv_typ: "R",
      itms: buildItems(t.lineItems),
    })),
  }));
}

function buildCDNUR(txns: Transaction[]) {
  return txns.map((t) => ({
    ntty: t.documentType === "CREDIT_NOTE" ? "C" : "D",
    nt_num: t.invoiceNumber || "",
    nt_dt: formatDate(t.invoiceDate),
    val: t.grandTotal,
    typ: t.supplyType === "INTER_STATE" ? "B2CL" : "B2CS",
    itms: buildItems(t.lineItems),
  }));
}

function buildHSNSummary(txns: Transaction[]) {
  const agg: Record<string, { hsn: string; desc: string; uqc: string; qty: number; val: number; txval: number; iamt: number; camt: number; samt: number; csamt: number }> = {};
  let num = 0;
  for (const t of txns) {
    for (const item of t.lineItems) {
      const hsn = item.hsnCode || item.sacCode || "0000";
      if (!agg[hsn]) {
        agg[hsn] = { hsn, desc: "", uqc: item.unit || "NOS", qty: 0, val: 0, txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 };
      }
      agg[hsn].qty += item.quantity || 1;
      agg[hsn].val += item.taxableValue + (item.igstAmount || 0) + (item.cgstAmount || 0) + (item.sgstAmount || 0);
      agg[hsn].txval += item.taxableValue || 0;
      agg[hsn].iamt += item.igstAmount || 0;
      agg[hsn].camt += item.cgstAmount || 0;
      agg[hsn].samt += item.sgstAmount || 0;
      agg[hsn].csamt += item.cessAmount || 0;
    }
  }
  return {
    data: Object.values(agg).map((h) => ({ num: ++num, hsn_sc: h.hsn, desc: h.desc, uqc: h.uqc, qty: h.qty, val: round(h.val), txval: round(h.txval), iamt: round(h.iamt), camt: round(h.camt), samt: round(h.samt), csamt: round(h.csamt) })),
  };
}

function buildItems(items: LineItem[]) {
  return items.map((item, i) => ({
    num: i + 1,
    itm_det: {
      txval: round(item.taxableValue),
      rt: item.gstRatePercent || 0,
      iamt: round(item.igstAmount || 0),
      camt: round(item.cgstAmount || 0),
      samt: round(item.sgstAmount || 0),
      csamt: round(item.cessAmount || 0),
    },
  }));
}

function formatDate(d: Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = fn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}
