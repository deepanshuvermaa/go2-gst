"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Home", icon: "M3 9.5L9 4l6 5.5V16a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" },
  { href: "/scan", label: "Scan", icon: "M1 5V3a2 2 0 012-2h2M13 1h2a2 2 0 012 2v2M17 13v2a2 2 0 01-2 2h-2M5 17H3a2 2 0 01-2-2v-2" },
  { href: "/bills", label: "Bills", icon: "M3 1h12a1 1 0 011 1v14l-2.5-1.5L11 16l-2-1.5L7 16l-2.5-1.5L2 16V2a1 1 0 011-1z" },
  { href: "/reports", label: "Reports", icon: "M3 14V8M7 14V4M11 14V9M15 14V6" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-canvas-white border-t border-ink-black/[0.06] z-50"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center gap-1 px-3 py-1.5 rounded-[8px]
                transition-colors duration-150
                ${active ? "text-deep-space-violet" : "text-muted-stone"}
              `}
              aria-current={active ? "page" : undefined}
            >
              <svg className="w-5 h-5" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
