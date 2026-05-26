"use client";

import { useState } from "react";
import { Badge, Button } from "@/components/ui";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadGSTR1 = async () => {
    setDownloading("gstr1");
    try {
      const res = await fetch("/api/gstr1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo", gstin: "27AABCU9603R1ZX", month: 11, year: 2024 }),
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "GSTR1-Nov-2024.json"; a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setDownloading(null);
  };

  const downloadGSTR3B = async () => {
    setDownloading("gstr3b");
    try {
      const res = await fetch("/api/gstr3b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo", month: 11, year: 2024 }),
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "GSTR3B-Nov-2024.json"; a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setDownloading(null);
  };

  const downloadTally = async () => {
    setDownloading("tally");
    try {
      const res = await fetch("/api/tally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo", month: 11, year: 2024 }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "tally-export-11-2024.xml"; a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setDownloading(null);
  };

  return (
    <div className="space-y-8">
      <div><h1 className="font-[var(--font-heading)] text-[24px] font-semibold text-[#1a1a2e]">Reports</h1><p className="text-[13px] text-[#94a3b8] mt-1">Export GST returns and financial reports</p></div>

      {/* GSTR-3B Summary (static display) */}
      <div>
        <h2 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e] mb-4">GSTR-3B Summary — Nov 2024</h2>
        <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead><tr className="bg-[#eef2fb] border-b border-[#e2e8f0]"><th className="text-left py-3 px-4 font-medium text-[#4a5568]">Component</th><th className="text-right py-3 px-4 font-medium text-[#4a5568]">CGST</th><th className="text-right py-3 px-4 font-medium text-[#4a5568]">SGST</th><th className="text-right py-3 px-4 font-medium text-[#4a5568]">IGST</th></tr></thead>
            <tbody className="text-[#1a1a2e]">
              <tr className="border-b border-[#e2e8f0]"><td className="py-3 px-4 text-[#4a5568]">3.1 — Output Tax</td><td className="text-right py-3 px-4 tabular-nums">₹12,450</td><td className="text-right py-3 px-4 tabular-nums">₹12,450</td><td className="text-right py-3 px-4 tabular-nums">₹18,624</td></tr>
              <tr className="border-b border-[#e2e8f0]"><td className="py-3 px-4 text-[#4a5568]">4A — ITC Available</td><td className="text-right py-3 px-4 tabular-nums text-[#22c55e]">₹10,200</td><td className="text-right py-3 px-4 tabular-nums text-[#22c55e]">₹10,200</td><td className="text-right py-3 px-4 tabular-nums text-[#22c55e]">₹17,790</td></tr>
              <tr><td className="py-3 px-4 font-semibold">5 — Net Payable</td><td className="text-right py-3 px-4 tabular-nums font-semibold">₹2,250</td><td className="text-right py-3 px-4 tabular-nums font-semibold">₹2,250</td><td className="text-right py-3 px-4 tabular-nums font-semibold">₹834</td></tr>
            </tbody>
          </table>
          <div className="px-4 py-3 bg-[#eef2fb] border-t border-[#e2e8f0] flex items-center justify-between">
            <p className="text-[13px] text-[#4a5568]">Total Net Payable: <span className="font-semibold text-[#1a1a2e]">₹5,334</span></p>
            <Badge variant="primary">Ready to file</Badge>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div>
        <h2 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e] mb-4">Export</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-[14px] border border-[#e2e8f0] p-4 hover:border-[#d6e4ff] hover:bg-[#eef2fb] transition-all">
            <p className="text-[13px] font-semibold text-[#1a1a2e]">GSTR-1 JSON</p>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">Upload to GST portal</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={downloadGSTR1} loading={downloading === "gstr1"}>Download</Button>
          </div>
          <div className="rounded-[14px] border border-[#e2e8f0] p-4 hover:border-[#d6e4ff] hover:bg-[#eef2fb] transition-all">
            <p className="text-[13px] font-semibold text-[#1a1a2e]">GSTR-3B JSON</p>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">Monthly return summary</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={downloadGSTR3B} loading={downloading === "gstr3b"}>Download</Button>
          </div>
          <div className="rounded-[14px] border border-[#e2e8f0] p-4 hover:border-[#d6e4ff] hover:bg-[#eef2fb] transition-all">
            <p className="text-[13px] font-semibold text-[#1a1a2e]">Tally XML</p>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">Import into Tally ERP</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={downloadTally} loading={downloading === "tally"}>Download</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
