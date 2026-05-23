/**
 * ITR Computation Engine — Income Tax Act 2025 (AY 2026-27)
 * Old vs New regime comparison + Advance tax quarterly calculator
 */

export interface ITRInput {
  grossSalary: number;
  businessIncome: number;
  otherIncome: number; // interest, dividends, etc.
  capitalGains: { shortTerm: number; longTerm: number };
  // Deductions (Old regime)
  section80C: number; // max 1.5L (PPF, ELSS, LIC, etc.)
  section80D: number; // medical insurance
  section80E: number; // education loan interest
  section80G: number; // donations
  section80TTA: number; // savings interest (max 10K)
  hra: number; // HRA exemption
  lta: number; // Leave Travel Allowance
  standardDeduction: number; // 50K old, 75K new
  homeLoanInterest: number; // Section 24(b) max 2L
  nps80CCD: number; // additional 50K NPS
  // Already paid
  tdsDeducted: number;
  advanceTaxPaid: number;
  selfAssessmentPaid: number;
}

interface TaxSlab { from: number; to: number; rate: number }

// New Regime slabs (AY 2026-27, post Budget 2025)
const NEW_REGIME_SLABS: TaxSlab[] = [
  { from: 0, to: 400000, rate: 0 },
  { from: 400000, to: 800000, rate: 5 },
  { from: 800000, to: 1200000, rate: 10 },
  { from: 1200000, to: 1600000, rate: 15 },
  { from: 1600000, to: 2000000, rate: 20 },
  { from: 2000000, to: 2400000, rate: 25 },
  { from: 2400000, to: Infinity, rate: 30 },
];

// Old Regime slabs
const OLD_REGIME_SLABS: TaxSlab[] = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250000, to: 500000, rate: 5 },
  { from: 500000, to: 1000000, rate: 20 },
  { from: 1000000, to: Infinity, rate: 30 },
];

export interface ITRResult {
  regime: "old" | "new";
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  taxBeforeCess: number;
  cess: number; // 4% health & education cess
  totalTax: number;
  rebate87A: number;
  netTax: number;
  alreadyPaid: number;
  balanceDue: number;
  refund: number;
}

export function computeITR(input: ITRInput): { oldRegime: ITRResult; newRegime: ITRResult; recommended: "old" | "new" } {
  const grossIncome = input.grossSalary + input.businessIncome + input.otherIncome + input.capitalGains.shortTerm + input.capitalGains.longTerm;
  const alreadyPaid = input.tdsDeducted + input.advanceTaxPaid + input.selfAssessmentPaid;

  // Old Regime
  const oldDeductions = Math.min(input.section80C, 150000) + input.section80D + input.section80E + input.section80G + Math.min(input.section80TTA, 10000) + input.hra + input.lta + 50000 + Math.min(input.homeLoanInterest, 200000) + Math.min(input.nps80CCD, 50000);
  const oldTaxable = Math.max(0, grossIncome - oldDeductions);
  const oldTax = computeSlabTax(oldTaxable, OLD_REGIME_SLABS);
  const oldRebate = oldTaxable <= 500000 ? Math.min(oldTax, 12500) : 0;
  const oldNetBeforeCess = Math.max(0, oldTax - oldRebate);
  const oldCess = oldNetBeforeCess * 0.04;
  const oldTotal = oldNetBeforeCess + oldCess;

  // New Regime
  const newDeductions = 75000; // only standard deduction in new regime
  const newTaxable = Math.max(0, grossIncome - newDeductions);
  const newTax = computeSlabTax(newTaxable, NEW_REGIME_SLABS);
  const newRebate = newTaxable <= 1200000 ? Math.min(newTax, 60000) : 0;
  const newNetBeforeCess = Math.max(0, newTax - newRebate);
  const newCess = newNetBeforeCess * 0.04;
  const newTotal = newNetBeforeCess + newCess;

  const oldResult: ITRResult = {
    regime: "old", grossIncome, deductions: oldDeductions, taxableIncome: oldTaxable,
    taxBeforeCess: oldTax, cess: oldCess, totalTax: oldTotal, rebate87A: oldRebate,
    netTax: oldTotal, alreadyPaid, balanceDue: Math.max(0, oldTotal - alreadyPaid), refund: Math.max(0, alreadyPaid - oldTotal),
  };

  const newResult: ITRResult = {
    regime: "new", grossIncome, deductions: newDeductions, taxableIncome: newTaxable,
    taxBeforeCess: newTax, cess: newCess, totalTax: newTotal, rebate87A: newRebate,
    netTax: newTotal, alreadyPaid, balanceDue: Math.max(0, newTotal - alreadyPaid), refund: Math.max(0, alreadyPaid - newTotal),
  };

  return { oldRegime: oldResult, newRegime: newResult, recommended: oldTotal <= newTotal ? "old" : "new" };
}

function computeSlabTax(income: number, slabs: TaxSlab[]): number {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.from) break;
    const taxableInSlab = Math.min(income, slab.to) - slab.from;
    tax += taxableInSlab * slab.rate / 100;
  }
  return Math.round(tax);
}

// ─── Advance Tax Calculator ───

export interface AdvanceTaxSchedule {
  totalLiability: number;
  installments: { dueDate: string; percentage: number; amount: number; cumulative: number }[];
  alreadyPaid: number;
  nextDue: { date: string; amount: number } | null;
}

export function computeAdvanceTax(annualTaxLiability: number, alreadyPaid = 0): AdvanceTaxSchedule {
  // Advance tax not required if liability < ₹10,000
  if (annualTaxLiability < 10000) {
    return { totalLiability: annualTaxLiability, installments: [], alreadyPaid, nextDue: null };
  }

  const installments = [
    { dueDate: "June 15", percentage: 15, amount: Math.round(annualTaxLiability * 0.15), cumulative: Math.round(annualTaxLiability * 0.15) },
    { dueDate: "September 15", percentage: 45, amount: Math.round(annualTaxLiability * 0.30), cumulative: Math.round(annualTaxLiability * 0.45) },
    { dueDate: "December 15", percentage: 75, amount: Math.round(annualTaxLiability * 0.30), cumulative: Math.round(annualTaxLiability * 0.75) },
    { dueDate: "March 15", percentage: 100, amount: Math.round(annualTaxLiability * 0.25), cumulative: annualTaxLiability },
  ];

  // Find next due
  const now = new Date();
  const currentMonth = now.getMonth();
  let nextDue: { date: string; amount: number } | null = null;

  if (currentMonth < 5) nextDue = { date: installments[0].dueDate, amount: installments[0].cumulative - alreadyPaid };
  else if (currentMonth < 8) nextDue = { date: installments[1].dueDate, amount: installments[1].cumulative - alreadyPaid };
  else if (currentMonth < 11) nextDue = { date: installments[2].dueDate, amount: installments[2].cumulative - alreadyPaid };
  else nextDue = { date: installments[3].dueDate, amount: installments[3].cumulative - alreadyPaid };

  if (nextDue && nextDue.amount <= 0) nextDue = null;

  return { totalLiability: annualTaxLiability, installments, alreadyPaid, nextDue };
}
