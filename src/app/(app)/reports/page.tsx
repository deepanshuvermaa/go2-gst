"use client";

import { Card, Badge, Button } from "@/components/ui";

const gstr3bSummary = {
  outputTax: { cgst: 12450, sgst: 12450, igst: 18624, cess: 0 },
  itcAvailable: { cgst: 10200, sgst: 10200, igst: 17790, cess: 0 },
  netPayable: { cgst: 2250, sgst: 2250, igst: 834, cess: 0 },
};

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-[28px] leading-[1.13] tracking-[-0.84px] text-deep-midnight">
            Reports
          </h1>
          <p className="text-[14px] text-muted-stone mt-1 tracking-[-0.02em]">
            GST return summaries and exports
          </p>
        </div>
        <select
          className="text-[13px] text-muted-stone bg-transparent border border-ink-black/10 rounded-[100px] px-3 py-1.5 focus:outline-none focus:border-deep-space-violet"
          aria-label="Select period"
        >
          <option>Nov 2024</option>
          <option>Oct 2024</option>
        </select>
      </div>

      {/* GSTR-3B Summary */}
      <div>
        <h2 className="text-[16px] font-medium text-ink-black tracking-[-0.02em] mb-4">
          GSTR-3B Summary
        </h2>
        <Card surface="dark" padding="lg">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] tracking-[-0.02em]">
              <thead>
                <tr className="text-canvas-white/60 border-b border-canvas-white/10">
                  <th className="text-left py-2 font-medium">Component</th>
                  <th className="text-right py-2 font-medium">CGST</th>
                  <th className="text-right py-2 font-medium">SGST</th>
                  <th className="text-right py-2 font-medium">IGST</th>
                  <th className="text-right py-2 font-medium">Cess</th>
                </tr>
              </thead>
              <tbody className="text-canvas-white">
                <tr className="border-b border-canvas-white/5">
                  <td className="py-3">3.1 — Output Tax</td>
                  <td className="text-right">{formatINR(gstr3bSummary.outputTax.cgst)}</td>
                  <td className="text-right">{formatINR(gstr3bSummary.outputTax.sgst)}</td>
                  <td className="text-right">{formatINR(gstr3bSummary.outputTax.igst)}</td>
                  <td className="text-right">{formatINR(gstr3bSummary.outputTax.cess)}</td>
                </tr>
                <tr className="border-b border-canvas-white/5">
                  <td className="py-3">4A — ITC Available</td>
                  <td className="text-right text-success">{formatINR(gstr3bSummary.itcAvailable.cgst)}</td>
                  <td className="text-right text-success">{formatINR(gstr3bSummary.itcAvailable.sgst)}</td>
                  <td className="text-right text-success">{formatINR(gstr3bSummary.itcAvailable.igst)}</td>
                  <td className="text-right text-success">{formatINR(gstr3bSummary.itcAvailable.cess)}</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">5 — Net Payable</td>
                  <td className="text-right font-medium">{formatINR(gstr3bSummary.netPayable.cgst)}</td>
                  <td className="text-right font-medium">{formatINR(gstr3bSummary.netPayable.sgst)}</td>
                  <td className="text-right font-medium">{formatINR(gstr3bSummary.netPayable.igst)}</td>
                  <td className="text-right font-medium">{formatINR(gstr3bSummary.netPayable.cess)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-canvas-white/10 flex items-center justify-between">
            <p className="text-[14px] text-canvas-white/80">
              Total Net Payable: <span className="font-medium text-canvas-white">{formatINR(5334)}</span>
            </p>
            <Badge variant="violet">Ready to file</Badge>
          </div>
        </Card>
      </div>

      {/* Export Actions */}
      <div>
        <h2 className="text-[16px] font-medium text-ink-black tracking-[-0.02em] mb-4">
          Export
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card surface="light" interactive padding="md" className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-ink-black tracking-[-0.02em]">GSTR-1 JSON</p>
              <p className="text-[12px] text-muted-stone">Upload directly to GST portal</p>
            </div>
            <Button variant="ghost" size="sm">Download</Button>
          </Card>
          <Card surface="light" interactive padding="md" className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-ink-black tracking-[-0.02em]">GSTR-3B JSON</p>
              <p className="text-[12px] text-muted-stone">Monthly return summary</p>
            </div>
            <Button variant="ghost" size="sm">Download</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
