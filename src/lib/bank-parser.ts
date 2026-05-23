/**
 * Bank Statement PDF Parsing + Auto-Categorization
 * Parses common Indian bank statement formats and categorizes transactions
 */

export interface BankTransaction {
  date: string;
  description: string;
  reference: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  category: string;
  categoryConfidence: number;
}

export interface ParsedStatement {
  bankName: string;
  accountNumber: string;
  period: { from: string; to: string };
  openingBalance: number;
  closingBalance: number;
  transactions: BankTransaction[];
  summary: { totalDebit: number; totalCredit: number; transactionCount: number };
}

// Category patterns for auto-classification
const CATEGORY_PATTERNS: { pattern: RegExp; category: string; confidence: number }[] = [
  // UPI patterns
  { pattern: /UPI\/.+\/SWIGGY|ZOMATO|DOMINOS/i, category: "food_entertainment", confidence: 0.95 },
  { pattern: /UPI\/.+\/UBER|OLA|RAPIDO/i, category: "travel", confidence: 0.95 },
  { pattern: /UPI\/.+\/AMAZON|FLIPKART|MYNTRA/i, category: "shopping", confidence: 0.9 },
  { pattern: /UPI\/.+\/PHONEPE|PAYTM|GPAY/i, category: "transfer", confidence: 0.7 },
  // NEFT/RTGS
  { pattern: /NEFT.*SALARY|SAL\s/i, category: "salary", confidence: 0.95 },
  { pattern: /NEFT.*RENT|HOUSE\s*RENT/i, category: "rent", confidence: 0.9 },
  { pattern: /NEFT.*GST|TAX\s*PAYMENT/i, category: "gst_payment", confidence: 0.95 },
  { pattern: /NEFT.*TDS/i, category: "tds_payment", confidence: 0.95 },
  // EMI/Loans
  { pattern: /EMI|LOAN\s*REPAY/i, category: "loan_emi", confidence: 0.95 },
  // Insurance
  { pattern: /LIC|INSURANCE|HDFC\s*LIFE|ICICI\s*PRU/i, category: "insurance", confidence: 0.9 },
  // Utilities
  { pattern: /ELECTRICITY|BESCOM|TATA\s*POWER|ADANI\s*ELEC/i, category: "utilities", confidence: 0.95 },
  { pattern: /AIRTEL|JIO|VODAFONE|BSNL|BROADBAND/i, category: "utilities", confidence: 0.9 },
  { pattern: /WATER\s*BILL|BWSSB/i, category: "utilities", confidence: 0.95 },
  // Bank charges
  { pattern: /CHARGES|ANNUAL\s*FEE|MAINTENANCE|SMS\s*ALERT/i, category: "bank_charges", confidence: 0.9 },
  // Interest
  { pattern: /INT\s*PAID|INTEREST\s*CREDIT/i, category: "interest", confidence: 0.9 },
  // ATM
  { pattern: /ATM\s*WDL|CASH\s*WDL|ATM/i, category: "cash_withdrawal", confidence: 0.95 },
  // Subscriptions
  { pattern: /NETFLIX|SPOTIFY|YOUTUBE|ADOBE|MICROSOFT|AWS|GOOGLE\s*CLOUD/i, category: "software", confidence: 0.9 },
];

export function parseBankStatement(text: string): ParsedStatement {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Detect bank from header
  const bankName = detectBank(lines.slice(0, 10).join(" "));

  // Extract account number
  const accMatch = lines.join(" ").match(/A\/C\s*(?:No\.?|Number)\s*:?\s*(\d{9,18})/i);
  const accountNumber = accMatch?.[1] || "";

  // Parse transactions
  const transactions: BankTransaction[] = [];
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (!dateMatch) continue;

    const amounts = line.match(/[\d,]+\.\d{2}/g);
    if (!amounts || amounts.length < 1) continue;

    const date = normalizeDate(dateMatch[1]);
    const desc = line.replace(dateRegex, "").replace(/[\d,]+\.\d{2}/g, "").trim();
    const parsedAmounts = amounts.map((a) => parseFloat(a.replace(/,/g, "")));

    let debit: number | null = null;
    let credit: number | null = null;
    let balance = 0;

    if (parsedAmounts.length >= 3) {
      debit = parsedAmounts[0] > 0 ? parsedAmounts[0] : null;
      credit = parsedAmounts[1] > 0 ? parsedAmounts[1] : null;
      balance = parsedAmounts[2];
    } else if (parsedAmounts.length === 2) {
      balance = parsedAmounts[1];
      if (line.toLowerCase().includes("cr") || line.includes("+")) {
        credit = parsedAmounts[0];
      } else {
        debit = parsedAmounts[0];
      }
    }

    const { category, confidence } = categorizeTransaction(desc);
    const refMatch = desc.match(/\b(\d{12,16})\b/);

    transactions.push({ date, description: desc, reference: refMatch?.[1] || "", debit, credit, balance, category, categoryConfidence: confidence });
  }

  const totalDebit = transactions.reduce((s, t) => s + (t.debit || 0), 0);
  const totalCredit = transactions.reduce((s, t) => s + (t.credit || 0), 0);

  return {
    bankName,
    accountNumber,
    period: { from: transactions[0]?.date || "", to: transactions[transactions.length - 1]?.date || "" },
    openingBalance: transactions[0]?.balance || 0,
    closingBalance: transactions[transactions.length - 1]?.balance || 0,
    transactions,
    summary: { totalDebit, totalCredit, transactionCount: transactions.length },
  };
}

export function categorizeTransaction(description: string): { category: string; confidence: number } {
  for (const { pattern, category, confidence } of CATEGORY_PATTERNS) {
    if (pattern.test(description)) return { category, confidence };
  }
  return { category: "other", confidence: 0.3 };
}

function detectBank(header: string): string {
  const h = header.toLowerCase();
  if (h.includes("hdfc")) return "HDFC Bank";
  if (h.includes("icici")) return "ICICI Bank";
  if (h.includes("sbi") || h.includes("state bank")) return "State Bank of India";
  if (h.includes("axis")) return "Axis Bank";
  if (h.includes("kotak")) return "Kotak Mahindra Bank";
  if (h.includes("yes bank")) return "Yes Bank";
  if (h.includes("idfc")) return "IDFC First Bank";
  if (h.includes("bob") || h.includes("baroda")) return "Bank of Baroda";
  if (h.includes("pnb") || h.includes("punjab national")) return "Punjab National Bank";
  if (h.includes("canara")) return "Canara Bank";
  return "Unknown Bank";
}

function normalizeDate(d: string): string {
  const parts = d.split(/[\/\-]/);
  if (parts.length !== 3) return d;
  const [day, month, year] = parts;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
