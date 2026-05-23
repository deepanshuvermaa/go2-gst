/**
 * India-specific validation utilities for GST compliance
 */

// PAN format: 3 letters + entity type + 1 letter + 4 digits + 1 letter
const PAN_REGEX = /^[A-Z]{3}[ABCFGHLJPTF][A-Z]\d{4}[A-Z]$/;

// GSTIN: 2-digit state + 10-char PAN + entity number + Z + checksum
const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/;

export function validatePAN(pan: string): boolean {
  return PAN_REGEX.test(pan);
}

export function validateGSTIN(gstin: string): { valid: boolean; stateCode: string | null; pan: string | null } {
  if (!gstin || gstin.length !== 15) {
    return { valid: false, stateCode: null, pan: null };
  }

  const formatValid = GSTIN_REGEX.test(gstin);
  const stateCode = gstin.substring(0, 2);
  const pan = gstin.substring(2, 12);

  // Verhoeff checksum validation
  const checksumValid = verifyGSTINChecksum(gstin);

  return {
    valid: formatValid && checksumValid,
    stateCode,
    pan,
  };
}

export function validateIFSC(ifsc: string): boolean {
  // Format: 4 letters (bank) + 0 + 6 alphanumeric (branch)
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}

export function crossCheckAmounts(
  lineItems: Array<{ taxable_value?: number | null; cgst_amount?: number | null; sgst_amount?: number | null; igst_amount?: number | null; cess_amount?: number | null }>,
  reportedTotal: number | null
): { calculated: number; matches: boolean } {
  const calculated = lineItems.reduce((sum, item) => {
    const taxable = item.taxable_value || 0;
    const cgst = item.cgst_amount || 0;
    const sgst = item.sgst_amount || 0;
    const igst = item.igst_amount || 0;
    const cess = item.cess_amount || 0;
    return sum + taxable + cgst + sgst + igst + cess;
  }, 0);

  const matches = reportedTotal !== null ? Math.abs(calculated - reportedTotal) <= 1 : false;
  return { calculated, matches };
}

// Verhoeff algorithm for GSTIN checksum
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const CHAR_MAP = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function verifyGSTINChecksum(gstin: string): boolean {
  try {
    const chars = gstin.toUpperCase().split("");
    let c = 0;
    for (let i = chars.length - 1; i >= 0; i--) {
      const idx = CHAR_MAP.indexOf(chars[i]);
      if (idx < 0) return false;
      c = VERHOEFF_D[c][VERHOEFF_P[(chars.length - i) % 8][idx % 10]];
    }
    return c === 0;
  } catch {
    return false;
  }
}

// Indian state codes mapping
export const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
  "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
  "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
  "16": "Tripura", "17": "Meghalaya", "18": "Assam",
  "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
  "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Dadra & Nagar Haveli", "26": "Daman & Diu", "27": "Maharashtra",
  "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman & Nicobar", "36": "Telangana",
  "37": "Andhra Pradesh (New)", "38": "Ladakh",
};
