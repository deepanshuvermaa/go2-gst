"use client";

import { Badge, Button } from "@/components/ui";

const gstr3b = {
  output: { cgst: 12450, sgst: 12450, igst: 18624, cess: 0 },
  itc: { cgst: 10200, sgst: 10200, igst: 17790, cess: 0 },
  net: { cgst: 2250, sgst: 2250, igst: 834, cess: 0 },
};

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-[24px] font-semibold text-[#1a1a2e]">Reports</h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">GST return summaries and exports</p>
        </div>
        <select className="h-[36px] px-3 text-[13px] text-[#4a5568] bg-[#fcfcfc] border border-[#e2e8f0] rounded-[10px] focus:outline-none focus:border-[#3b5bdb]">
          <option>Nov 2024</option>
          <option>Oct 2024</option>
        </select>
      </div>

      {/* GSTR-3B */}
      <div>
        <h2 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e] mb-4">GSTR-3B Summary</h2>
        <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#eef2fb] border-b border-[#e2e8f0]">
                <th className="text-left py-3 px-4 font-medium text-[#4a5568]">Component</th>
                <th className="text-right py-3 px-4 font-medium text-[#4a5568]">CGST</th>
                <th className="text-right py-3 px-4 font-medium text-[#4a5568]">SGST</th>
                <th className="text-right py-3 px-4 font-medium text-[#4a5568]">IGST</th>
                <th className="text-right py-3 px-4 font-medium text-[#4a5568]">Cess</th>
              </tr>
            </thead>
            <tbody className="text-[#1a1a2e]">
              <tr className="border-b border-[#e2e8f0]">
                <td className="py-3 px-4 text-[#4a5568]">3.1 — Output Tax</td>
                <td className="text-right py-3 px-4 tabular-nums">{fmt(gstr3b.output.cgst)}</td>
                <td className="text-right py-3 px-4 tabular-nums">{fmt(gstr3b.output.sgst)}</td>
                <td className="text-right py-3 px-4 tabular-nums">{fmt(gstr3b.output.igst)}</td>
                <td className="text-right py-3 px-4 tabular-nums">{fmt(gstr3b.output.cess)}</td>
              </tr>
              <tr className="border-b border-[#e2e8f0]">
                <td className="py-3 px-4 text-[#4a5568]">4A — ITC Available</td>
                <td className="text-right py-3 px-4 tabular-nums text-[#22c55e]">{fmt(gstr3b.itc.cgst)}</td>
                <td className="text-right py-3 px-4 tabular-nums text-[#22c55e]">{fmt(gstr3b.itc.sgst)}</td>
                <td className="text-right py-3 px-4 tabular-nums text-[#22c55e]">{fmt(gstr3b.itc.igst)}</td>
                <td className="text-right py-3 px-4 tabular-nums text-[#22c55e]">{fmt(gstr3b.itc.cess)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">5 — Net Payable</td>
                <td className="text-right py-3 px-4 tabular-nums font-semibold">{fmt(gstr3b.net.cgst)}</td>
                <td className="text-right py-3 px-4 tabular-nums font-semibold">{fmt(gstr3b.net.sgst)}</td>
                <td className="text-right py-3 px-4 tabular-nums font-semibold">{fmt(gstr3b.net.igst)}</td>
                <td className="text-right py-3 px-4 tabular-nums font-semibold">{fmt(gstr3b.net.cess)}</td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 py-3 bg-[#eef2fb] border-t border-[#e2e8f0] flex items-center justify-between">
            <p className="text-[13px] text-[#4a5568]">Total Net Payable: <span className="font-semibold text-[#1a1a2e]">₹5,334</span></p>
            <Badge variant="primary">Ready to file</Badge>
          </div>
        </div>
      </div>

      {/* Export */}
      <div>
        <h2 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e] mb-4">Export</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-[14px] border border-[#e2e8f0] p-4 flex items-center justify-between hover:border-[#d6e4ff] hover:bg-[#eef2fb] transition-all">
            <div>
              <p className="text-[13px] font-semibold text-[#1a1a2e]">GSTR-1 JSON</p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">Upload directly to GST portal</p>
            </div>
            <Button variant="secondary" size="sm">Download</Button>
          </div>
          <div className="rounded-[14px] border border-[#e2e8f0] p-4 flex items-center justify-between hover:border-[#d6e4ff] hover:bg-[#eef2fb] transition-all">
            <div>
              <p className="text-[13px] font-semibold text-[#1a1a2e]">GSTR-3B JSON</p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">Monthly return summary</p>
            </div>
            <Button variant="secondary" size="sm">Download</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
