"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 9.5L9 4l6 5.5V16a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" },
  { href: "/scan", label: "Scan Bill", icon: "M1 5V3a2 2 0 012-2h2M13 1h2a2 2 0 012 2v2M17 13v2a2 2 0 01-2 2h-2M5 17H3a2 2 0 01-2-2v-2" },
  { href: "/bills", label: "Bills", icon: "M3 1h12a1 1 0 011 1v14l-2.5-1.5L11 16l-2-1.5L7 16l-2.5-1.5L2 16V2a1 1 0 011-1z" },
  { href: "/invoices/create", label: "Create Invoice", icon: "M4 2h10l3 3v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM6 9h6M6 12h4" },
  { href: "/vendors", label: "Vendors", icon: "M9 1a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4zM2 17c0-3 3-5 7-5s7 2 7 5" },
  { href: "/bank-statements", label: "Bank Statements", icon: "M2 4h14a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V5a1 1 0 011-1zM1 7h16" },
  { href: "/reports", label: "Reports", icon: "M3 14V8M7 14V4M11 14V9M15 14V6" },
  { href: "/itr", label: "ITR Calculator", icon: "M9 1v16M1 9h16M4 4l10 10M14 4L4 14" },
  { href: "/ca", label: "CA Portal", icon: "M5 5a3 3 0 016 0 3 3 0 01-6 0zM12 5a3 3 0 016 0 3 3 0 01-6 0zM2 17c0-2 2-4 5-4s5 2 5 4M9 17c0-2 2-4 5-4s5 2 5 4" },
  { href: "/settings", label: "Settings", icon: "M9 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[220px] h-screen bg-[#fcfcfc] border-r border-[#e2e8f0] fixed left-0 top-0">
      <div className="h-[60px] flex items-center px-5">
        <Link href="/dashboard" className="font-[var(--font-heading)] text-[16px] font-semibold text-[#1a1a2e]">
          Go2GST
        </Link>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-0.5" aria-label="Main">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-2.5 h-[36px] px-3 rounded-[8px] text-[13px] font-medium transition-all duration-150
                ${active
                  ? "bg-[#eef2fb] text-[#3b5bdb]"
                  : "text-[#4a5568] hover:bg-[#eef2fb] hover:text-[#1a1a2e]"
                }
              `}
              aria-current={active ? "page" : undefined}
            >
              <svg className="w-[16px] h-[16px] shrink-0" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#e2e8f0]">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-[8px] bg-[#eef2fb] flex items-center justify-center">
            <span className="text-[11px] font-semibold text-[#3b5bdb]">U</span>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#1a1a2e]">User</p>
            <p className="text-[11px] text-[#94a3b8]">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
