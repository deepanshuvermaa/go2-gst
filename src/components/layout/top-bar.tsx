"use client";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = "Go2GST" }: TopBarProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-canvas-white/80 backdrop-blur-md border-b border-ink-black/[0.06]">
      <div className="flex items-center justify-between h-14 px-4">
        <span className="font-[var(--font-display)] text-[17px] tracking-[-0.03em] text-deep-midnight font-medium">
          {title}
        </span>
        <button
          className="w-8 h-8 rounded-full bg-deep-midnight flex items-center justify-center"
          aria-label="Account"
        >
          <span className="text-[11px] text-canvas-white font-medium">U</span>
        </button>
      </div>
    </header>
  );
}
