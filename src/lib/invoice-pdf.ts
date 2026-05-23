/**
 * Invoice PDF Generation — Create GST-compliant invoices
 * Generates HTML template that can be rendered to PDF via puppeteer or returned as printable page
 */

import { formatINR, amountInWords } from "./hsn";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  seller: { name: string; gstin: string; address: string; state: string; stateCode: string; phone?: string; email?: string };
  buyer: { name: string; gstin?: string; address: string; state: string; stateCode: string; phone?: string };
  items: InvoiceItem[];
  supplyType: "intra_state" | "inter_state";
  reverseCharge: boolean;
  bankDetails?: { name: string; account: string; ifsc: string };
  notes?: string;
}

interface InvoiceItem {
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discount?: number;
  gstRate: number;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const items = data.items.map((item, i) => {
    const taxable = item.quantity * item.rate - (item.discount || 0);
    const gstAmt = taxable * item.gstRate / 100;
    const isIntra = data.supplyType === "intra_state";
    return { ...item, sl: i + 1, taxable, cgst: isIntra ? gstAmt / 2 : 0, sgst: isIntra ? gstAmt / 2 : 0, igst: isIntra ? 0 : gstAmt, total: taxable + gstAmt };
  });

  const subtotal = items.reduce((s, i) => s + i.taxable, 0);
  const totalCgst = items.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = items.reduce((s, i) => s + i.sgst, 0);
  const totalIgst = items.reduce((s, i) => s + i.igst, 0);
  const grandTotal = items.reduce((s, i) => s + i.total, 0);
  const isIntra = data.supplyType === "intra_state";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${data.invoiceNumber}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;font-size:12px;color:#1a1a2e;padding:40px}
.invoice{max-width:800px;margin:0 auto}
.header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #3b5bdb}
.seller h1{font-size:20px;font-weight:700;color:#1a1a2e}
.seller p{color:#4a5568;margin-top:2px}
.invoice-meta{text-align:right}
.invoice-meta h2{font-size:24px;color:#3b5bdb;font-weight:600}
.invoice-meta p{color:#4a5568;margin-top:2px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px}
.party-box{padding:16px;border-radius:10px;background:#eef2fb;border:1px solid #d6e4ff}
.party-box h3{font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin-bottom:8px}
.party-box p{color:#1a1a2e;font-size:12px;line-height:1.5}
.party-box .gstin{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#3b5bdb;margin-top:4px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th{background:#eef2fb;padding:10px 8px;text-align:left;font-size:11px;font-weight:600;color:#4a5568;border-bottom:1px solid #d6e4ff}
td{padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:12px}
.text-right{text-align:right}
.totals{display:flex;justify-content:flex-end}
.totals-box{width:280px}
.totals-row{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:#4a5568}
.totals-row.grand{border-top:2px solid #1a1a2e;padding-top:10px;margin-top:6px;font-size:14px;font-weight:700;color:#1a1a2e}
.words{margin-top:12px;padding:12px;background:#eef2fb;border-radius:8px;font-size:11px;color:#4a5568}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between}
.bank{font-size:11px;color:#4a5568}
.bank strong{color:#1a1a2e}
.signature{text-align:right;font-size:11px;color:#4a5568}
@media print{body{padding:20px}table{page-break-inside:auto}}
</style></head><body>
<div class="invoice">
<div class="header">
<div class="seller"><h1>${data.seller.name}</h1><p>${data.seller.address}</p><p>GSTIN: ${data.seller.gstin} | State: ${data.seller.state} (${data.seller.stateCode})</p>${data.seller.phone ? `<p>Ph: ${data.seller.phone}</p>` : ""}</div>
<div class="invoice-meta"><h2>TAX INVOICE</h2><p><strong>#${data.invoiceNumber}</strong></p><p>Date: ${data.invoiceDate}</p>${data.dueDate ? `<p>Due: ${data.dueDate}</p>` : ""}<p>Reverse Charge: ${data.reverseCharge ? "Yes" : "No"}</p></div>
</div>
<div class="parties">
<div class="party-box"><h3>Bill To</h3><p><strong>${data.buyer.name}</strong></p><p>${data.buyer.address}</p><p>State: ${data.buyer.state} (${data.buyer.stateCode})</p>${data.buyer.gstin ? `<p class="gstin">GSTIN: ${data.buyer.gstin}</p>` : ""}</div>
<div class="party-box"><h3>Ship To</h3><p><strong>${data.buyer.name}</strong></p><p>${data.buyer.address}</p></div>
</div>
<table>
<thead><tr><th>#</th><th>Description</th><th>HSN</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Taxable</th>${isIntra ? '<th class="text-right">CGST</th><th class="text-right">SGST</th>' : '<th class="text-right">IGST</th>'}<th class="text-right">Total</th></tr></thead>
<tbody>${items.map((i) => `<tr><td>${i.sl}</td><td>${i.description}</td><td>${i.hsnCode}</td><td class="text-right">${i.quantity} ${i.unit}</td><td class="text-right">${formatINR(i.rate)}</td><td class="text-right">${formatINR(i.taxable)}</td>${isIntra ? `<td class="text-right">${formatINR(i.cgst)}</td><td class="text-right">${formatINR(i.sgst)}</td>` : `<td class="text-right">${formatINR(i.igst)}</td>`}<td class="text-right">${formatINR(i.total)}</td></tr>`).join("")}</tbody>
</table>
<div class="totals"><div class="totals-box">
<div class="totals-row"><span>Subtotal</span><span>${formatINR(subtotal)}</span></div>
${isIntra ? `<div class="totals-row"><span>CGST</span><span>${formatINR(totalCgst)}</span></div><div class="totals-row"><span>SGST</span><span>${formatINR(totalSgst)}</span></div>` : `<div class="totals-row"><span>IGST</span><span>${formatINR(totalIgst)}</span></div>`}
<div class="totals-row grand"><span>Grand Total</span><span>${formatINR(grandTotal)}</span></div>
</div></div>
<div class="words"><strong>Amount in words:</strong> ${amountInWords(grandTotal)}</div>
${data.bankDetails ? `<div class="footer"><div class="bank"><strong>Bank Details</strong><br>Bank: ${data.bankDetails.name}<br>A/C: ${data.bankDetails.account}<br>IFSC: ${data.bankDetails.ifsc}</div><div class="signature"><br><br><br>Authorized Signatory<br><strong>${data.seller.name}</strong></div></div>` : ""}
</div></body></html>`;
}
