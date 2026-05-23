"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/scan", label: "Scan Bill", icon: ScanIcon },
  { href: "/bills", label: "Bills", icon: BillsIcon },
  { href: "/reports", label: "Reports", icon: ReportsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen border-r border-ink-black/[0.06] bg-canvas-white fixed left-0 top-0">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-[var(--font-display)] text-[20px] tracking-[-0.03em] text-deep-midnight font-medium">
            Go2GST
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[8px]
                text-[14px] tracking-[-0.02em] transition-colors duration-150
                ${active
                  ? "bg-violet-muted text-deep-space-violet font-medium"
                  : "text-muted-stone hover:text-ink-black hover:bg-ink-black/[0.03]"
                }
              `}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-ink-black/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-deep-midnight flex items-center justify-center">
            <span className="text-[12px] text-canvas-white font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-ink-black truncate">User</p>
            <p className="text-[12px] text-muted-stone truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Minimal inline SVG icons — no external dependency
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="7" height="7" rx="1.5" />
      <rect x="10" y="1" width="7" height="4" rx="1.5" />
      <rect x="1" y="10" width="7" height="4" rx="1.5" />
      <rect x="10" y="7" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5V3a2 2 0 012-2h2M13 1h2a2 2 0 012 2v2M17 13v2a2 2 0 01-2 2h-2M5 17H3a2 2 0 01-2-2v-2" />
      <circle cx="9" cy="9" r="3" />
    </svg>
  );
}

function BillsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1h12a1 1 0 011 1v14l-2.5-1.5L11 16l-2-1.5L7 16l-2.5-1.5L2 16V2a1 1 0 011-1z" />
      <path d="M6 5h6M6 8h6M6 11h3" />
    </svg>
  );
}

function ReportsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14V8M7 14V4M11 14V9M15 14V6" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" />
    </svg>
  );
}
