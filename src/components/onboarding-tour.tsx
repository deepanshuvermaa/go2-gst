"use client";

import { useState, useEffect, useCallback } from "react";

interface TourStep {
  target: string; // CSS selector or element ID
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  { target: "#tour-summary", title: "Your Financial Overview", description: "See total expenses, GST paid, and ITC claimable at a glance. Updates in real-time as you scan bills.", position: "bottom" },
  { target: "#tour-actions", title: "Quick Actions", description: "One-tap access to scan bills, generate GSTR-1, GSTR-3B, or view all your transactions.", position: "bottom" },
  { target: "#tour-bills", title: "Recent Bills", description: "All your scanned invoices appear here with vendor name, GSTIN, amount, and ITC eligibility status.", position: "top" },
  { target: "[href='/scan']", title: "Scan a Bill", description: "Upload or photograph any Indian invoice. Our AI extracts GSTIN, HSN codes, tax splits, and line items in 3 seconds.", position: "bottom" },
  { target: "[href='/vendors']", title: "Vendor Directory", description: "Auto-built from your scanned bills. See total spend per vendor, recurring patterns, and GSTIN verification status.", position: "right" },
  { target: "[href='/reports']", title: "GST Reports", description: "Generate GSTR-1 and GSTR-3B JSON files ready for direct upload to the GST portal. Also export to Tally XML.", position: "right" },
  { target: "[href='/itr']", title: "ITR Calculator", description: "Compare old vs new tax regime. See which saves you more. Get quarterly advance tax schedule with due dates.", position: "right" },
];

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem("go2gst_tour_complete");
    if (!seen) setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const el = document.querySelector(TOUR_STEPS[step].target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [active, step]);

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) setStep(step + 1);
    else finish();
  }, [step]);

  const finish = () => {
    setActive(false);
    localStorage.setItem("go2gst_tour_complete", "true");
  };

  if (!active || !targetRect) return null;

  const current = TOUR_STEPS[step];
  const pos = current.position || "bottom";

  // Calculate dialog position
  let dialogStyle: React.CSSProperties = {};
  if (pos === "bottom") {
    dialogStyle = { top: targetRect.bottom + 12, left: Math.max(16, targetRect.left) };
  } else if (pos === "top") {
    dialogStyle = { top: targetRect.top - 200, left: Math.max(16, targetRect.left) };
  } else if (pos === "right") {
    dialogStyle = { top: targetRect.top, left: targetRect.right + 12 };
  } else {
    dialogStyle = { top: targetRect.top, left: targetRect.left - 340 };
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <div className="absolute inset-0 bg-[#1a1a2e]/40 transition-opacity duration-300" />
        {/* Highlight cutout */}
        <div
          className="absolute border-2 border-[#3b5bdb] rounded-[12px] shadow-[0_0_0_4px_rgba(59,91,219,0.15)] transition-all duration-300"
          style={{ top: targetRect.top - 6, left: targetRect.left - 6, width: targetRect.width + 12, height: targetRect.height + 12 }}
        />
      </div>

      {/* Dialog */}
      <div
        className="fixed z-[9999] w-[320px] bg-[#fcfcfc] border border-[#e2e8f0] rounded-[14px] p-5 shadow-[0_8px_30px_rgba(26,26,46,0.12)] transition-all duration-300"
        style={dialogStyle}
      >
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          {TOUR_STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-[#3b5bdb]" : i < step ? "w-1.5 bg-[#3b5bdb]" : "w-1.5 bg-[#e2e8f0]"}`} />
          ))}
        </div>

        <h3 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e]">{current.title}</h3>
        <p className="text-[13px] text-[#4a5568] leading-[1.5] mt-2">{current.description}</p>

        <div className="flex items-center justify-between mt-5">
          <button onClick={finish} className="text-[12px] font-medium text-[#94a3b8] hover:text-[#4a5568] transition-colors">
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="h-[32px] px-3 text-[12px] font-medium text-[#4a5568] rounded-[8px] border border-[#e2e8f0] hover:bg-[#eef2fb] transition-colors">
                Back
              </button>
            )}
            <button onClick={next} className="h-[32px] px-4 text-[12px] font-medium text-white bg-[#3b5bdb] rounded-[8px] hover:bg-[#4c6ef5] transition-colors">
              {step === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#94a3b8] mt-3">{step + 1} of {TOUR_STEPS.length}</p>
      </div>
    </>
  );
}
