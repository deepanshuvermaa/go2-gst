/**
 * Vendor Directory, Duplicate Detection, Monthly P&L
 */

import { db } from "./db";

// ─── Vendor Directory ───

export interface VendorSummary {
  gstin: string;
  name: string;
  state: string;
  totalTransactions: number;
  totalAmount: number;
  lastTransaction: Date | null;
  categories: string[];
}

export async function getVendorDirectory(userId: string): Promise<VendorSummary[]> {
  const transactions = await db.transaction.findMany({
    where: { userId, sellerGstin: { not: null } },
    select: { sellerGstin: true, sellerName: true, sellerState: true, grandTotal: true, invoiceDate: true, category: true },
    orderBy: { invoiceDate: "desc" },
  });

  const vendors = new Map<string, VendorSummary>();
  for (const t of transactions) {
    const gstin = t.sellerGstin!;
    if (!vendors.has(gstin)) {
      vendors.set(gstin, { gstin, name: t.sellerName || "", state: t.sellerState || "", totalTransactions: 0, totalAmount: 0, lastTransaction: null, categories: [] });
    }
    const v = vendors.get(gstin)!;
    v.totalTransactions++;
    v.totalAmount += Number(t.grandTotal || 0);
    if (!v.lastTransaction || (t.invoiceDate && t.invoiceDate > v.lastTransaction)) v.lastTransaction = t.invoiceDate;
    if (t.category && !v.categories.includes(t.category)) v.categories.push(t.category);
    if (t.sellerName && !v.name) v.name = t.sellerName;
  }

  return Array.from(vendors.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

// ─── Duplicate Detection ───

export interface DuplicateGroup {
  invoiceNumber: string;
  sellerGstin: string;
  transactions: { id: string; invoiceDate: Date | null; grandTotal: number }[];
}

export async function detectDuplicates(userId: string): Promise<DuplicateGroup[]> {
  const transactions = await db.transaction.findMany({
    where: { userId, invoiceNumber: { not: null } },
    select: { id: true, invoiceNumber: true, sellerGstin: true, invoiceDate: true, grandTotal: true },
  });

  const groups = new Map<string, typeof transactions>();
  for (const t of transactions) {
    const key = `${t.invoiceNumber}_${t.sellerGstin || ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  return Array.from(groups.entries())
    .filter(([, txns]) => txns.length > 1)
    .map(([, txns]) => ({
      invoiceNumber: txns[0].invoiceNumber!,
      sellerGstin: txns[0].sellerGstin || "",
      transactions: txns.map((t) => ({ id: t.id, invoiceDate: t.invoiceDate, grandTotal: Number(t.grandTotal || 0) })),
    }));
}

// ─── Monthly P&L ───

export interface MonthlyPL {
  month: number;
  year: number;
  income: number;
  expenses: number;
  netProfit: number;
  gstCollected: number;
  gstPaid: number;
  netGST: number;
  categoryBreakdown: { category: string; amount: number }[];
}

export async function getMonthlyPL(userId: string, month: number, year: number): Promise<MonthlyPL> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const transactions = await db.transaction.findMany({
    where: { userId, invoiceDate: { gte: startDate, lte: endDate } },
    select: { transactionDirection: true, grandTotal: true, subtotal: true, totalCgst: true, totalSgst: true, totalIgst: true, category: true },
  });

  const income = transactions.filter((t) => t.transactionDirection === "INCOME").reduce((s, t) => s + Number(t.grandTotal || 0), 0);
  const expenses = transactions.filter((t) => t.transactionDirection === "EXPENSE").reduce((s, t) => s + Number(t.grandTotal || 0), 0);
  const gstCollected = transactions.filter((t) => t.transactionDirection === "INCOME").reduce((s, t) => s + Number(t.totalCgst || 0) + Number(t.totalSgst || 0) + Number(t.totalIgst || 0), 0);
  const gstPaid = transactions.filter((t) => t.transactionDirection === "EXPENSE").reduce((s, t) => s + Number(t.totalCgst || 0) + Number(t.totalSgst || 0) + Number(t.totalIgst || 0), 0);

  // Category breakdown
  const catMap = new Map<string, number>();
  for (const t of transactions.filter((t) => t.transactionDirection === "EXPENSE")) {
    const cat = t.category || "Uncategorized";
    catMap.set(cat, (catMap.get(cat) || 0) + Number(t.grandTotal || 0));
  }

  return {
    month, year, income, expenses,
    netProfit: income - expenses,
    gstCollected, gstPaid,
    netGST: gstCollected - gstPaid,
    categoryBreakdown: Array.from(catMap.entries()).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
  };
}
