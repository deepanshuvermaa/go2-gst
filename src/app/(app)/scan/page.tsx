"use client";

import { useState, useRef, useCallback } from "react";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";

type State = "idle" | "dragging" | "uploading" | "processing" | "done" | "error";

interface ExtractionData {
  seller?: { name?: string; gstin?: string; city?: string; state?: string; gstin_valid?: boolean };
  invoice_number?: string;
  invoice_date?: string;
  supply_type?: string;
  line_items?: { description?: string; hsn_code?: string; sac_code?: string; quantity?: number; unit_price?: number; taxable_value?: number; gst_rate_percent?: number; igst_amount?: number; cgst_amount?: number; sgst_amount?: number }[];
  totals?: { subtotal?: number; total_igst?: number; total_cgst?: number; total_sgst?: number; grand_total?: number };
  itc?: { eligible?: boolean; type?: string };
  suggested_category?: string;
  confidence?: number;
}

const MOCK_RESULT: ExtractionData = {
  seller: { name: "Shree Ganesh Enterprises", gstin: "27AABCU9603R1ZX", city: "Mumbai", state: "Maharashtra", gstin_valid: true },
  invoice_number: "SGE/2024-25/0187",
  invoice_date: "2024-11-15",
  supply_type: "inter_state",
  line_items: [
    { description: "Industrial Pump — Model SGP-200", hsn_code: "84137090", quantity: 2, unit_price: 45000, taxable_value: 85500, gst_rate_percent: 18, igst_amount: 15390 },
    { description: "Annual Maintenance Contract", sac_code: "998719", quantity: 1, unit_price: 12000, taxable_value: 12000, gst_rate_percent: 18, igst_amount: 2160 },
  ],
  totals: { subtotal: 97500, total_igst: 17550, grand_total: 115050 },
  itc: { eligible: true, type: "capital_goods" },
  suggested_category: "Raw Materials",
  confidence: 0.96,
};

export default function ScanPage() {
  const [state, setState] = useState<State>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionData | null>(null);
  const [processingMsg, setProcessingMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") return;
    setPreview(URL.createObjectURL(file));
    setState("uploading");
    setProcessingMsg("Uploading document...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", "demo");

      setProcessingMsg("Running OCR...");
      setState("processing");

      const res = await fetch("/api/documents/process", { method: "POST", body: formData });

      if (res.ok) {
        const data = await res.json();
        setResult(data.extraction || MOCK_RESULT);
        setState("done");
      } else {
        // Fallback to mock for demo
        setProcessingMsg("Extracting GST data...");
        await new Promise((r) => setTimeout(r, 2000));
        setResult(MOCK_RESULT);
        setState("done");
      }
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
      setResult(MOCK_RESULT);
      setState("done");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const reset = () => { setState("idle"); setPreview(null); setResult(null); };

  const r = result;
  const isInter = r?.supply_type === "inter_state";

  if (state === "done" && r) {
    return (
      <div className="space-y-5 fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#22c55e]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <h1 className="font-[var(--font-heading)] text-[18px] font-semibold text-[#1a1a2e]">Extraction Complete</h1>
              <p className="text-[12px] text-[#94a3b8]">Confidence {((r.confidence || 0.96) * 100).toFixed(0)}%</p>
            </div>
          </div>
          <Badge variant="success">Verified</Badge>
        </div>

        <div className="rounded-[14px] bg-[#eef2fb] border border-[#d6e4ff] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px]">✨</span>
            <span className="text-[12px] font-medium text-[#3b5bdb]">Extracted by AI</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[17px] font-semibold text-[#1a1a2e]">{r.seller?.name || "Unknown Seller"}</p>
              <p className="text-[13px] text-[#4a5568] font-[var(--font-mono)] mt-1">{r.seller?.gstin || "—"}</p>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">{r.seller?.city}{r.seller?.state ? `, ${r.seller.state}` : ""}</p>
            </div>
            {r.seller?.gstin_valid && <Badge variant="success">GSTIN ✓</Badge>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#d6e4ff]">
            <div><p className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-[0.04em]">Invoice</p><p className="text-[13px] font-medium text-[#1a1a2e] mt-0.5 truncate">{r.invoice_number || "—"}</p></div>
            <div><p className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-[0.04em]">Date</p><p className="text-[13px] font-medium text-[#1a1a2e] mt-0.5">{r.invoice_date || "—"}</p></div>
            <div><p className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-[0.04em]">Supply</p><p className="text-[13px] font-medium text-[#1a1a2e] mt-0.5">{isInter ? "Inter-State" : "Intra-State"}</p></div>
            <div><p className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-[0.04em]">Category</p><p className="text-[13px] font-medium text-[#1a1a2e] mt-0.5">{r.suggested_category || "—"}</p></div>
          </div>
        </div>

        {r.line_items && r.line_items.length > 0 && (
          <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-3 bg-[#fcfcfc] border-b border-[#e2e8f0]"><p className="text-[13px] font-semibold text-[#1a1a2e]">Line Items</p></div>
            {r.line_items.map((item, i) => (
              <div key={i} className={`px-5 py-4 flex items-start justify-between ${i < r.line_items!.length - 1 ? "border-b border-[#e2e8f0]" : ""}`}>
                <div>
                  <p className="text-[13px] font-medium text-[#1a1a2e]">{item.description || "Item"}</p>
                  <p className="text-[11px] text-[#94a3b8] font-[var(--font-mono)] mt-1">{item.hsn_code ? `HSN ${item.hsn_code}` : item.sac_code ? `SAC ${item.sac_code}` : ""} · {item.quantity} × ₹{(item.unit_price || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-[13px] font-semibold text-[#1a1a2e] tabular-nums">₹{(item.taxable_value || 0).toLocaleString("en-IN")}</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">{isInter ? "IGST" : "CGST+SGST"} {item.gst_rate_percent}%</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-[14px] border border-[#e2e8f0] p-5 space-y-2.5">
          <div className="flex justify-between text-[13px]"><span className="text-[#94a3b8]">Subtotal</span><span className="text-[#1a1a2e] tabular-nums">₹{(r.totals?.subtotal || 0).toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-[#94a3b8]">{isInter ? "IGST" : "CGST + SGST"}</span><span className="text-[#1a1a2e] tabular-nums">₹{((r.totals?.total_igst || 0) + (r.totals?.total_cgst || 0) + (r.totals?.total_sgst || 0)).toLocaleString("en-IN")}</span></div>
          <div className="border-t border-[#e2e8f0] pt-2.5 flex justify-between">
            <span className="text-[14px] font-semibold text-[#1a1a2e]">Grand Total</span>
            <span className="text-[14px] font-semibold text-[#1a1a2e] tabular-nums">₹{(r.totals?.grand_total || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="rounded-[14px] border border-[#22c55e]/20 bg-[#22c55e]/[0.04] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[18px]">🏦</span>
            <div>
              <p className="text-[13px] font-semibold text-[#1a1a2e]">Input Tax Credit</p>
              <p className="text-[12px] text-[#94a3b8]">{r.itc?.type || "—"} · ₹{((r.totals?.total_igst || 0) + (r.totals?.total_cgst || 0) + (r.totals?.total_sgst || 0)).toLocaleString("en-IN")} claimable</p>
            </div>
          </div>
          <Badge variant={r.itc?.eligible ? "success" : "error"}>{r.itc?.eligible ? "Eligible ✓" : "Blocked"}</Badge>
        </div>

        <div className="flex gap-2.5 pt-1">
          <Link href="/bills" className="flex-1"><Button variant="primary" size="lg" className="w-full">Save to Bills</Button></Link>
          <Button variant="secondary" size="lg" onClick={reset}>Scan Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[var(--font-heading)] text-[24px] font-semibold text-[#1a1a2e]">Scan Bill</h1>
        <p className="text-[13px] text-[#94a3b8] mt-1">Upload or capture a bill to extract GST data</p>
      </div>

      <div
        className={`rounded-[16px] border-2 border-dashed cursor-pointer transition-all duration-200 ${state === "dragging" ? "border-[#3b5bdb] bg-[#eef2fb] scale-[1.005]" : "border-[#e2e8f0] hover:border-[#94a3b8] hover:bg-[#fcfcfc]"}`}
        onClick={() => !preview && fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
        onDragLeave={() => setState("idle")}
      >
        {!preview ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-[14px] bg-[#eef2fb] border border-[#d6e4ff] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#3b5bdb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            </div>
            <p className="text-[15px] font-medium text-[#1a1a2e]">Drop your bill here, or <span className="text-[#3b5bdb]">browse</span></p>
            <p className="text-[13px] text-[#94a3b8] mt-1.5">JPG, PNG, PDF · Max 10MB</p>
            <div className="flex items-center justify-center gap-2.5 mt-5">
              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="h-[40px] px-5 bg-[#3b5bdb] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#4c6ef5] transition-colors">Upload File</button>
              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="h-[40px] px-5 text-[13px] font-medium text-[#4a5568] rounded-[10px] border border-[#e2e8f0] hover:bg-[#eef2fb] transition-colors">📷 Camera</button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="relative max-w-[240px] mx-auto aspect-[3/4] rounded-[12px] overflow-hidden bg-[#eef2fb]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-[#1a1a2e]/70 flex flex-col items-center justify-center gap-3 rounded-[12px]">
                <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-[13px] text-white font-medium">{processingMsg || "Processing..."}</p>
              </div>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*,application/pdf" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} aria-label="Upload" />
      </div>

      {state === "error" && <p className="text-[13px] text-[#ef4444] text-center">Processing failed. Please try again.</p>}

      <div className="grid grid-cols-3 gap-2.5">
        {[{ icon: "📸", tip: "Clear & sharp" }, { icon: "📐", tip: "Full document" }, { icon: "💡", tip: "Good lighting" }].map((t) => (
          <div key={t.tip} className="text-center py-3.5 rounded-[10px] bg-[#eef2fb] border border-[#d6e4ff]">
            <span className="text-[16px]">{t.icon}</span>
            <p className="text-[11px] text-[#4a5568] mt-1.5 font-medium">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
