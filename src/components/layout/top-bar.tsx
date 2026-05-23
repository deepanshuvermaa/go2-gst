"use client";

export function TopBar({ title = "Go2GST" }: { title?: string }) {
  return (
    <header className="md:hidden sticky top-0 z-40 h-[56px] bg-[rgba(252,252,252,0.92)] backdrop-blur-[16px] border-b border-[#e2e8f0] flex items-center justify-between px-5">
      <span className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e]">{title}</span>
      <div className="w-7 h-7 rounded-[8px] bg-[#eef2fb] flex items-center justify-center">
        <span className="text-[11px] font-semibold text-[#3b5bdb]">U</span>
      </div>
    </header>
  );
}
