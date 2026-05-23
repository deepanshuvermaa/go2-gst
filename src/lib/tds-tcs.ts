/**
 * TDS/TCS Detection & Computation Engine
 * Covers: 194C, 194J, 194H, 194I, 194Q, 194O, 195, 206C(1H)
 */

export interface TDSResult {
  applicable: boolean;
  section: string | null;
  rate: number;
  amount: number;
  netPayable: number;
  description: string;
}

export interface TCSResult {
  applicable: boolean;
  section: string | null;
  rate: number;
  amount: number;
}

interface TDSSection {
  section: string;
  description: string;
  rate: number; // % for PAN holders
  rateNoPAN: number; // % without PAN
  threshold: number; // annual threshold
  categories: string[];
}

const TDS_SECTIONS: TDSSection[] = [
  { section: "194C", description: "Payment to contractors", rate: 1, rateNoPAN: 20, threshold: 30000, categories: ["contractors", "maintenance", "logistics", "construction"] },
  { section: "194J", description: "Professional/Technical fees", rate: 10, rateNoPAN: 20, threshold: 30000, categories: ["professional_services", "software", "consulting", "legal", "accounting"] },
  { section: "194H", description: "Commission/Brokerage", rate: 5, rateNoPAN: 20, threshold: 15000, categories: ["commission", "brokerage", "advertising"] },
  { section: "194I(a)", description: "Rent - Plant/Machinery", rate: 2, rateNoPAN: 20, threshold: 240000, categories: ["rent_machinery", "equipment_rental"] },
  { section: "194I(b)", description: "Rent - Land/Building", rate: 10, rateNoPAN: 20, threshold: 240000, categories: ["rent", "office_rent", "warehouse_rent"] },
  { section: "194A", description: "Interest (non-bank)", rate: 10, rateNoPAN: 20, threshold: 5000, categories: ["interest"] },
  { section: "194Q", description: "Purchase of goods (>50L)", rate: 0.1, rateNoPAN: 5, threshold: 5000000, categories: ["raw_materials", "goods_purchase"] },
  { section: "195", description: "Payment to non-resident", rate: 10, rateNoPAN: 20, threshold: 0, categories: ["foreign_payment", "overseas"] },
  { section: "194O", description: "E-commerce operator", rate: 1, rateNoPAN: 5, threshold: 500000, categories: ["ecommerce"] },
];

export function detectTDS(
  amount: number,
  category: string,
  annualCumulative: number,
  hasPAN: boolean,
  isNonResident = false
): TDSResult {
  if (isNonResident) {
    const rate = hasPAN ? 10 : 20;
    return { applicable: true, section: "195", rate, amount: amount * rate / 100, netPayable: amount * (1 - rate / 100), description: "Payment to non-resident" };
  }

  const section = TDS_SECTIONS.find((s) => s.categories.includes(category.toLowerCase()));
  if (!section) return { applicable: false, section: null, rate: 0, amount: 0, netPayable: amount, description: "" };

  // Check threshold
  if (annualCumulative + amount < section.threshold) {
    return { applicable: false, section: section.section, rate: 0, amount: 0, netPayable: amount, description: section.description };
  }

  const rate = hasPAN ? section.rate : section.rateNoPAN;
  const tdsAmount = Math.round(amount * rate / 100);

  return {
    applicable: true,
    section: section.section,
    rate,
    amount: tdsAmount,
    netPayable: amount - tdsAmount,
    description: section.description,
  };
}

export function detectTCS(
  saleAmount: number,
  annualSaleToParty: number,
  isEcommerce = false
): TCSResult {
  // 206C(1H) - Sale of goods > ₹50L in a year
  if (!isEcommerce && annualSaleToParty + saleAmount > 5000000) {
    const taxableAmount = (annualSaleToParty + saleAmount) - 5000000;
    const effectiveAmount = Math.min(saleAmount, taxableAmount);
    return { applicable: true, section: "206C(1H)", rate: 0.1, amount: Math.round(effectiveAmount * 0.1 / 100) };
  }

  // E-commerce TCS under 52 of CGST
  if (isEcommerce) {
    return { applicable: true, section: "52", rate: 1, amount: Math.round(saleAmount * 1 / 100) };
  }

  return { applicable: false, section: null, rate: 0, amount: 0 };
}

export function getTDSSectionForCategory(category: string): TDSSection | null {
  return TDS_SECTIONS.find((s) => s.categories.includes(category.toLowerCase())) || null;
}
