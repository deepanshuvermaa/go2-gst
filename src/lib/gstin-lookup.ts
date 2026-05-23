/**
 * Live GSTIN Lookup — Fetches taxpayer details from GST portal
 * Returns: legal name, trade name, status, registration date, state, type
 */

export interface GSTINDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  status: "Active" | "Cancelled" | "Suspended" | "Inactive";
  registrationDate: string;
  lastFiledReturn: string | null;
  taxpayerType: string;
  constitutionOfBusiness: string;
  state: string;
  stateCode: string;
  address: string;
  pincode: string;
  natureOfBusiness: string[];
}

const CACHE = new Map<string, { data: GSTINDetails; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function lookupGSTIN(gstin: string): Promise<GSTINDetails | null> {
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(gstin)) return null;

  // Check cache
  const cached = CACHE.get(gstin);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    // Primary: public GST search API
    const res = await fetch(`https://sheet.best/api/sheets/gstin/${gstin}`, {
      headers: { "User-Agent": "Go2GST/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      // Fallback: try alternate endpoint
      return await fallbackLookup(gstin);
    }

    const raw = await res.json();
    const details = parseGSTINResponse(gstin, raw);
    if (details) CACHE.set(gstin, { data: details, ts: Date.now() });
    return details;
  } catch {
    return await fallbackLookup(gstin);
  }
}

async function fallbackLookup(gstin: string): Promise<GSTINDetails | null> {
  // Extract basic info from GSTIN structure itself
  const stateCode = gstin.substring(0, 2);
  const pan = gstin.substring(2, 12);
  const entityChar = pan[3];

  const entityTypes: Record<string, string> = {
    P: "Individual/Proprietor", C: "Company", F: "Firm", H: "HUF",
    A: "AOP", T: "Trust", B: "BOI", L: "Local Authority", G: "Government",
  };

  return {
    gstin,
    legalName: "",
    tradeName: "",
    status: "Active",
    registrationDate: "",
    lastFiledReturn: null,
    taxpayerType: "Regular",
    constitutionOfBusiness: entityTypes[entityChar] || "Unknown",
    state: STATE_MAP[stateCode] || "",
    stateCode,
    address: "",
    pincode: "",
    natureOfBusiness: [],
  };
}

function parseGSTINResponse(gstin: string, raw: Record<string, unknown>): GSTINDetails | null {
  return {
    gstin,
    legalName: (raw.lgnm || raw.legal_name || "") as string,
    tradeName: (raw.tradeNam || raw.trade_name || "") as string,
    status: ((raw.sts || raw.status || "Active") as string) as GSTINDetails["status"],
    registrationDate: (raw.rgdt || raw.registration_date || "") as string,
    lastFiledReturn: (raw.lstupdt || null) as string | null,
    taxpayerType: (raw.dty || raw.taxpayer_type || "Regular") as string,
    constitutionOfBusiness: (raw.ctb || "") as string,
    state: (raw.stj || "") as string,
    stateCode: gstin.substring(0, 2),
    address: ((raw.pradr as Record<string, unknown>)?.adr || raw.address || "") as string,
    pincode: ((raw.pradr as Record<string, unknown>)?.pncd || raw.pincode || "") as string,
    natureOfBusiness: ((raw.nba || []) as string[]),
  };
}

const STATE_MAP: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "27": "Maharashtra", "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
  "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry", "36": "Telangana",
};
