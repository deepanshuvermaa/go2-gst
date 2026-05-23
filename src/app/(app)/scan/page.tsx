"use client";

import { useState, useRef, useCallback } from "react";
import { Badge } from "@/components/ui";
import Link from "next/link";

type FlowState = "idle" | "dragging" | "uploading" | "processing" | "done";

const MOCK = {
  seller: { name: "Shree Ganesh Enterprises", gstin: "27AABCU9603R1ZX", city: "Mumbai", state: "Maharashtra" },
  invoice: "SGE/2024-25/0187",
  date: "15 Nov 2024",
  supply: "Inter-State",
  items: [
    { desc: "Industrial Pump — Model SGP-200", code: "HSN 84137090", qty: "2 × ₹45,000", taxable: 85500, gst: "IGST 18%", tax: 15390 },
    { desc: "Annual Maintenance Contract", code: "SAC 998719", qty: "1 × ₹12,000", taxable: 12000, gst: "IGST 18%", tax: 2160 },
  ],
  subtotal: 97500,
  totalTax: 17550,
  grand: 115050,
  confidence: 96,
  category: "Raw Materials",
};

export default function ScanPage() {
  const [state, setState] = useState<FlowState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") return;
    setPreview(URL.createObjectURL(file));
    setState("uploading");
    setTimeout(() => setState("processing"), 800);
    setTimeout(() => setState("done"), 3200);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const reset = () => { setState("idle"); setPreview(null); };

  if (state === "done") {
    return (
      <div className="space-y-6 fade-in">
        {/* Success Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <h1 className="font-[var(--font-display)] text-[22px] font-semibold tracking-[-0.03em] text-deep-midnight">Extraction Complete</h1>
              <p className="text-[12px] text-muted-stone mt-0.5">Confidence {MOCK.confidence}% · All fields validated</p>
            </div>
          </div>
          <Badge variant="success">Verified</Badge>
        </div>

        {/* Seller Card */}
        <div className="bg-deep-midnight rounded-[14px] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-deep-space-violet/8 rounded-full blur-3xl" />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-canvas-white/40 font-medium">Seller</p>
              <p className="text-[20px] font-semibold text-canvas-white tracking-[-0.02em] mt-2">{MOCK.seller.name}</p>
              <p className="text-[13px] text-canvas-white/60 font-[var(--font-mono)] mt-1.5">{MOCK.seller.gstin}</p>
              <p className="text-[12px] text-canvas-white/40 mt-1">{MOCK.seller.city}, {MOCK.seller.state}</p>
            </div>
            <span className="text-[11px] font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">GSTIN Valid ✓</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-canvas-white/[0.06]">
            {[
              { label: "Invoice", value: MOCK.invoice },
              { label: "Date", value: MOCK.date },
              { label: "Supply", value: MOCK.supply },
              { label: "Category", value: MOCK.category },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[10px] uppercase tracking-[0.06em] text-canvas-white/30">{f.label}</p>
                <p className="text-[13px] text-canvas-white font-medium mt-1 truncate">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-[14px] border border-ink-black/[0.06] overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-black/[0.04] bg-surface-subtle">
            <p className="text-[13px] font-semibold text-deep-midnight tracking-[-0.01em]">Line Items</p>
          </div>
          <div className="divide-y divide-ink-black/[0.04]">
            {MOCK.items.map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink-black tracking-[-0.01em]">{item.desc}</p>
                  <p className="text-[12px] text-muted-stone mt-1 font-[var(--font-mono)]">{item.code} · {item.qty}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-semibold text-ink-black tabular-nums">₹{item.taxable.toLocaleString("en-IN")}</p>
                  <p className="text-[11px] text-muted-stone mt-0.5">{item.gst} = ₹{item.tax.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-[14px] border border-ink-black/[0.06] p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-stone">Subtotal</span>
              <span className="text-ink-black tabular-nums">₹{MOCK.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-stone">IGST (18%)</span>
              <span className="text-ink-black tabular-nums">₹{MOCK.totalTax.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-px bg-ink-black/[0.06] my-1" />
            <div className="flex justify-between">
              <span className="text-[15px] font-semibold text-deep-midnight">Grand Total</span>
              <span className="text-[15px] font-semibold text-deep-midnight tabular-nums">₹{MOCK.grand.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* ITC */}
        <div className="flex items-center justify-between rounded-[14px] border border-success/20 bg-success/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-success/10 flex items-center justify-center">
              <span className="text-[16px]">🏦</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink-black tracking-[-0.01em]">Input Tax Credit</p>
              <p className="text-[12px] text-muted-stone mt-0.5">Capital Goods · ₹17,550 claimable</p>
            </div>
          </div>
          <Badge variant="success">Eligible ✓</Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link href="/bills" className="flex-1">
            <button className="w-full bg-deep-midnight text-canvas-white py-3.5 rounded-[100px] text-[14px] font-medium hover:bg-carbon-gray transition-colors">
              Save to Bills
            </button>
          </Link>
          <button onClick={reset} className="px-6 py-3.5 rounded-[100px] text-[14px] font-medium text-deep-space-violet border border-deep-space-violet/20 hover:bg-violet-muted transition-colors">
            Scan Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[var(--font-display)] text-[32px] font-semibold tracking-[-0.03em] text-deep-midnight">
          Scan Bill
        </h1>
        <p className="text-[14px] text-muted-stone mt-1 tracking-[-0.01em]">
          Upload or capture a bill to extract GST data automatically
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`
          relative rounded-[16px] border-2 border-dashed transition-all duration-200 cursor-pointer
          ${state === "dragging"
            ? "border-deep-space-violet bg-violet-muted scale-[1.01]"
            : "border-ink-black/[0.08] hover:border-ink-black/[0.15] hover:bg-surface-subtle"
          }
        `}
        onClick={() => !preview && fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
        onDragLeave={() => setState("idle")}
      >
        {!preview ? (
          <div className="py-20 px-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-[14px] bg-ink-black/[0.03] flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-muted-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-[16px] font-medium text-ink-black tracking-[-0.02em]">
              Drop your bill here, or <span className="text-deep-space-violet">browse</span>
            </p>
            <p className="text-[13px] text-muted-stone mt-2">
              Supports JPG, PNG, PDF · Max 10MB
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                className="bg-deep-midnight text-canvas-white px-6 py-3 rounded-[100px] text-[13px] font-medium hover:bg-carbon-gray transition-colors"
              >
                Upload File
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                className="px-6 py-3 rounded-[100px] text-[13px] font-medium text-muted-stone border border-ink-black/[0.08] hover:border-ink-black/[0.15] transition-colors"
              >
                📷 Use Camera
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative max-w-xs mx-auto aspect-[3/4] rounded-[12px] overflow-hidden bg-ink-black/[0.02]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Bill preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-deep-midnight/80 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-[3px] border-canvas-white/20 border-t-canvas-white rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-[14px] text-canvas-white font-medium">
                    {state === "uploading" ? "Uploading..." : "Extracting GST data..."}
                  </p>
                  <p className="text-[12px] text-canvas-white/50 mt-1">
                    {state === "processing" ? "Reading GSTIN, HSN codes, tax amounts..." : "Almost there..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          aria-label="Upload bill"
        />
      </div>

      {/* Tips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "📸", tip: "Clear & sharp" },
          { icon: "📐", tip: "Full document" },
          { icon: "💡", tip: "Good lighting" },
        ].map((t) => (
          <div key={t.tip} className="text-center py-4 px-3 rounded-[10px] bg-surface-subtle">
            <span className="text-[18px]">{t.icon}</span>
            <p className="text-[11px] text-muted-stone mt-1.5 font-medium">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
