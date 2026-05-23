/**
 * GSTR-3B Summary Calculator
 * Computes: 3.1 Output Tax, 4A ITC Available, 4B ITC Reversed, Net Payable
 */

interface TaxTransaction {
  documentType: string;
  supplyType: string | null;
  reverseCharge: boolean;
  totalCgst: number | null;
  totalSgst: number | null;
  totalIgst: number | null;
  totalCess: number | null;
  subtotal: number | null;
  itcEligible: boolean | null;
  itcType: string | null;
  itcBlockedReason: string | null;
  transactionDirection: string;
}

interface TaxComponent {
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
}

interface GSTR3BSummary {
  // 3.1 - Outward supplies
  outputTax: {
    taxableValue: number;
    interState: TaxComponent;
    intraState: TaxComponent;
    total: TaxComponent;
  };
  // 3.2 - Inter-state supplies to unregistered
  interStateUnregistered: { pos: string; taxableValue: number; igst: number }[];
  // 4A - ITC Available
  itcAvailable: {
    inputs: TaxComponent;
    capitalGoods: TaxComponent;
    inputServices: TaxComponent;
    total: TaxComponent;
  };
  // 4B - ITC Reversed
  itcReversed: TaxComponent;
  // 4C - Net ITC
  netITC: TaxComponent;
  // 5 - Net tax payable
  netPayable: TaxComponent;
  // 5.1 - Interest/penalty
  interest: TaxComponent;
}

export function computeGSTR3B(
  salesTransactions: TaxTransaction[],
  purchaseTransactions: TaxTransaction[]
): GSTR3BSummary {
  // 3.1 - Output tax from sales
  const sales = salesTransactions.filter((t) => t.transactionDirection === "INCOME" || t.documentType === "TAX_INVOICE");
  const outputTax = computeOutputTax(sales);

  // 4A - ITC from purchases
  const purchases = purchaseTransactions.filter((t) => t.transactionDirection === "EXPENSE" && t.itcEligible);
  const itcAvailable = computeITC(purchases);

  // 4B - ITC Reversed (blocked under 17(5))
  const blocked = purchaseTransactions.filter((t) => t.itcBlockedReason);
  const itcReversed = sumTax(blocked);

  // 4C - Net ITC
  const netITC: TaxComponent = {
    cgst: itcAvailable.total.cgst - itcReversed.cgst,
    sgst: itcAvailable.total.sgst - itcReversed.sgst,
    igst: itcAvailable.total.igst - itcReversed.igst,
    cess: itcAvailable.total.cess - itcReversed.cess,
  };

  // 5 - Net payable = Output - Net ITC (minimum 0)
  const netPayable: TaxComponent = {
    cgst: Math.max(0, outputTax.total.cgst - netITC.cgst),
    sgst: Math.max(0, outputTax.total.sgst - netITC.sgst),
    igst: Math.max(0, outputTax.total.igst - netITC.igst),
    cess: Math.max(0, outputTax.total.cess - netITC.cess),
  };

  return {
    outputTax,
    interStateUnregistered: [],
    itcAvailable,
    itcReversed,
    netITC,
    netPayable,
    interest: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
  };
}

function computeOutputTax(txns: TaxTransaction[]) {
  const interState = txns.filter((t) => t.supplyType === "INTER_STATE");
  const intraState = txns.filter((t) => t.supplyType === "INTRA_STATE");

  const interTax = sumTax(interState);
  const intraTax = sumTax(intraState);

  return {
    taxableValue: txns.reduce((s, t) => s + (t.subtotal || 0), 0),
    interState: interTax,
    intraState: intraTax,
    total: {
      cgst: interTax.cgst + intraTax.cgst,
      sgst: interTax.sgst + intraTax.sgst,
      igst: interTax.igst + intraTax.igst,
      cess: interTax.cess + intraTax.cess,
    },
  };
}

function computeITC(txns: TaxTransaction[]) {
  const inputs = txns.filter((t) => t.itcType === "inputs");
  const capital = txns.filter((t) => t.itcType === "capital_goods");
  const services = txns.filter((t) => t.itcType === "input_services");

  const inputsTax = sumTax(inputs);
  const capitalTax = sumTax(capital);
  const servicesTax = sumTax(services);

  return {
    inputs: inputsTax,
    capitalGoods: capitalTax,
    inputServices: servicesTax,
    total: {
      cgst: inputsTax.cgst + capitalTax.cgst + servicesTax.cgst,
      sgst: inputsTax.sgst + capitalTax.sgst + servicesTax.sgst,
      igst: inputsTax.igst + capitalTax.igst + servicesTax.igst,
      cess: inputsTax.cess + capitalTax.cess + servicesTax.cess,
    },
  };
}

function sumTax(txns: TaxTransaction[]): TaxComponent {
  return txns.reduce(
    (acc, t) => ({
      cgst: acc.cgst + (t.totalCgst || 0),
      sgst: acc.sgst + (t.totalSgst || 0),
      igst: acc.igst + (t.totalIgst || 0),
      cess: acc.cess + (t.totalCess || 0),
    }),
    { cgst: 0, sgst: 0, igst: 0, cess: 0 }
  );
}
