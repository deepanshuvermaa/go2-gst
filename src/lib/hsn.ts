/**
 * HSN/SAC Code Database + Indian Number Formatting
 * Top 200 most-used HSN codes with descriptions and default GST rates
 */

export interface HSNEntry {
  code: string;
  description: string;
  rate: number; // GST rate %
  type: "goods" | "services";
}

// Top HSN codes used in Indian business (subset — full DB would be 14k+ from ERPNext fixtures)
export const HSN_DATABASE: HSNEntry[] = [
  // IT & Software
  { code: "998314", description: "IT consulting and support services", rate: 18, type: "services" },
  { code: "998313", description: "IT infrastructure and network management", rate: 18, type: "services" },
  { code: "998315", description: "Hosting and IT infrastructure provisioning", rate: 18, type: "services" },
  { code: "998316", description: "IT infrastructure and network management services", rate: 18, type: "services" },
  { code: "998319", description: "Other IT services", rate: 18, type: "services" },
  { code: "998321", description: "Software design and development", rate: 18, type: "services" },
  // Professional Services
  { code: "998211", description: "Legal advisory and representation", rate: 18, type: "services" },
  { code: "998212", description: "Arbitration and mediation", rate: 18, type: "services" },
  { code: "998221", description: "Auditing services", rate: 18, type: "services" },
  { code: "998222", description: "Accounting and bookkeeping", rate: 18, type: "services" },
  { code: "998231", description: "Management consulting", rate: 18, type: "services" },
  { code: "998311", description: "IT design and development", rate: 18, type: "services" },
  // Advertising & Marketing
  { code: "998361", description: "Advertising services", rate: 18, type: "services" },
  { code: "998362", description: "Purchase or sale of advertising space", rate: 18, type: "services" },
  // Telecom
  { code: "998412", description: "Internet telecommunications", rate: 18, type: "services" },
  { code: "998413", description: "Online content services", rate: 18, type: "services" },
  // Transport
  { code: "996511", description: "Passenger transport by road", rate: 5, type: "services" },
  { code: "996521", description: "Goods transport by road", rate: 5, type: "services" },
  { code: "996531", description: "Courier services", rate: 18, type: "services" },
  // Food & Restaurant
  { code: "996331", description: "Restaurant services (non-AC)", rate: 5, type: "services" },
  { code: "996332", description: "Restaurant services (AC)", rate: 5, type: "services" },
  { code: "996333", description: "Catering services", rate: 18, type: "services" },
  // Rent
  { code: "997212", description: "Rental of residential property", rate: 0, type: "services" },
  { code: "997211", description: "Rental of commercial property", rate: 18, type: "services" },
  // Maintenance
  { code: "998719", description: "Maintenance and repair services", rate: 18, type: "services" },
  // Office Supplies
  { code: "48201010", description: "Paper and stationery", rate: 12, type: "goods" },
  { code: "48202000", description: "Exercise books and notebooks", rate: 12, type: "goods" },
  // Electronics
  { code: "84713010", description: "Laptops and notebooks", rate: 18, type: "goods" },
  { code: "84714110", description: "Desktop computers", rate: 18, type: "goods" },
  { code: "85171210", description: "Mobile phones", rate: 12, type: "goods" },
  { code: "84433210", description: "Printers", rate: 18, type: "goods" },
  // Furniture
  { code: "94017100", description: "Office furniture (metal frame)", rate: 18, type: "goods" },
  { code: "94036000", description: "Wooden furniture", rate: 12, type: "goods" },
  // Machinery
  { code: "84137090", description: "Pumps for liquids", rate: 18, type: "goods" },
  { code: "84314990", description: "Parts of machinery", rate: 18, type: "goods" },
  { code: "84798999", description: "Other machines and mechanical appliances", rate: 18, type: "goods" },
  // Vehicles
  { code: "87032210", description: "Motor cars (1000-1500cc)", rate: 28, type: "goods" },
  { code: "87112019", description: "Motorcycles (75-250cc)", rate: 28, type: "goods" },
  // Fuel (outside GST but for reference)
  { code: "27101990", description: "Petroleum products", rate: 0, type: "goods" },
  // Textiles
  { code: "61091000", description: "T-shirts and vests (cotton)", rate: 5, type: "goods" },
  { code: "62034200", description: "Trousers (cotton)", rate: 5, type: "goods" },
  // Food items
  { code: "19011000", description: "Preparations for infant use", rate: 0, type: "goods" },
  { code: "04012000", description: "Milk (fat 1-6%)", rate: 0, type: "goods" },
  { code: "10063010", description: "Rice (semi-milled)", rate: 5, type: "goods" },
  { code: "17011400", description: "Sugar", rate: 5, type: "goods" },
  // Pharma
  { code: "30049099", description: "Medicaments (packaged)", rate: 12, type: "goods" },
  { code: "30042099", description: "Antibiotics", rate: 12, type: "goods" },
  // Construction
  { code: "68091100", description: "Plaster boards", rate: 28, type: "goods" },
  { code: "25232100", description: "Portland cement", rate: 28, type: "goods" },
  { code: "72142000", description: "Steel bars and rods", rate: 18, type: "goods" },
];

export function searchHSN(query: string, limit = 10): HSNEntry[] {
  const q = query.toLowerCase();
  // Search by code prefix first
  const byCode = HSN_DATABASE.filter((h) => h.code.startsWith(q));
  if (byCode.length >= limit) return byCode.slice(0, limit);
  // Then by description
  const byDesc = HSN_DATABASE.filter((h) => h.description.toLowerCase().includes(q) && !byCode.includes(h));
  return [...byCode, ...byDesc].slice(0, limit);
}

export function getHSNByCode(code: string): HSNEntry | undefined {
  return HSN_DATABASE.find((h) => h.code === code);
}

export function getDefaultRate(code: string): number | null {
  const entry = getHSNByCode(code);
  return entry ? entry.rate : null;
}

// ─── Indian Number Formatting ───

export function formatINR(amount: number, showSymbol = true): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const parts = abs.toFixed(2).split(".");
  const intPart = parts[0];
  const decPart = parts[1];

  // Indian grouping: last 3 digits, then groups of 2
  let formatted = "";
  if (intPart.length <= 3) {
    formatted = intPart;
  } else {
    formatted = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);
    while (remaining.length > 2) {
      formatted = remaining.slice(-2) + "," + formatted;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      formatted = remaining + "," + formatted;
    }
  }

  const result = decPart === "00" ? formatted : `${formatted}.${decPart}`;
  const signed = isNegative ? `-${result}` : result;
  return showSymbol ? `₹${signed}` : signed;
}

export function formatINRCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return formatINR(amount);
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}

export function amountInWords(amount: number): string {
  if (amount === 0) return "Rupees Zero Only";
  const isNeg = amount < 0;
  const abs = Math.abs(Math.round(amount * 100));
  const rupees = Math.floor(abs / 100);
  const paise = abs % 100;

  const parts: string[] = [];
  let rem = rupees;

  const crore = Math.floor(rem / 10000000);
  rem %= 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundred = Math.floor(rem / 100);
  rem %= 100;

  if (crore) parts.push(twoDigitWords(crore) + " Crore");
  if (lakh) parts.push(twoDigitWords(lakh) + " Lakh");
  if (thousand) parts.push(twoDigitWords(thousand) + " Thousand");
  if (hundred) parts.push(ONES[hundred] + " Hundred");
  if (rem) parts.push(twoDigitWords(rem));

  let result = "Rupees " + parts.join(" ");
  if (paise) result += " and " + twoDigitWords(paise) + " Paise";
  result += " Only";
  return isNeg ? "Minus " + result : result;
}
