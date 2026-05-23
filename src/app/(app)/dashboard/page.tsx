"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";

const bills = [
  { id: "1", seller: "Amazon India", gstin: "27AABCU9603R1ZX", amount: 4999, gstRate: 18, date: "14 Nov", category: "Office Supplies", itc: true },
  { id: "2", seller: "Airtel Broadband", gstin: "06AARCA1234B1Z5", amount: 1180, gstRate: 18, date: "10 Nov", category: "Utilities", itc: true },
  { id: "3", seller: "Swiggy Business", gstin: "29AABCS1234C1Z8", amount: 890, gstRate: 5, date: "8 Nov", category: "Food & Beverage", itc: false },
  { id: "4", seller: "Uber India", gstin: "27AABCU1234D1Z2", amount: 340, gstRate: 5, date: "7 Nov", category: "Travel", itc: true },
  { id: "5", seller: "Ramesh Stationery", gstin: null, amount: 1240, gstRate: 18, date: "5 Nov", category: "Office Supplies", itc: false },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-muted-stone tracking-[-0.01em]">Welcome back</p>
          <h1 className="font-[var(--font-display)] text-[32px] font-semibold tracking-[-0.03em] text-deep-midnight mt-1">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-[13px] text-muted-stone bg-canvas-white border border-ink-black/[0.08] rounded-[100px] px-4 py-2 focus:outline-none focus:border-deep-space-violet transition-colors cursor-pointer" aria-label="Period">
            <option>Nov 2024</option>
            <option>Oct 2024</option>
            <option>Sep 2024</option>
          </select>
          <Link href="/scan" className="bg-deep-midnight text-canvas-white px-5 py-2 rounded-[100px] text-[13px] font-medium hover:bg-carbon-gray transition-colors">
            + Scan Bill
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-deep-midnight rounded-[14px] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-deep-space-violet/10 rounded-full blur-3xl" />
          <p className="text-[11px] uppercase tracking-[0.08em] text-canvas-white/40 font-medium">Total Expenses</p>
          <p className="font-[var(--font-display)] text-[36px] font-semibold text-canvas-white tracking-[-0.03em] mt-3">
            ₹2,41,800
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
              ↑ 12%
            </span>
            <span className="text-[11px] text-canvas-white/40">vs last month</span>
          </div>
        </div>

        <div className="bg-carbon-gray rounded-[14px] p-6">
          <p className="text-[11px] uppercase tracking-[0.08em] text-canvas-white/40 font-medium">GST Paid</p>
          <p className="font-[var(--font-display)] text-[36px] font-semibold text-canvas-white tracking-[-0.03em] mt-3">
            ₹43,524
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] text-canvas-white/40">Output tax liability</span>
          </div>
        </div>

        <div className="bg-carbon-gray rounded-[14px] p-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
          <p className="text-[11px] uppercase tracking-[0.08em] text-canvas-white/40 font-medium">ITC Claimable</p>
          <p className="font-[var(--font-display)] text-[36px] font-semibold text-canvas-white tracking-[-0.03em] mt-3">
            ₹38,190
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
              ↑ 15%
            </span>
            <span className="text-[11px] text-canvas-white/40">input credit</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/scan", icon: "📷", label: "Scan Bill" },
          { href: "/reports", icon: "📊", label: "GSTR-1" },
          { href: "/reports", icon: "📋", label: "GSTR-3B" },
          { href: "/bills", icon: "📄", label: "All Bills" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="flex items-center gap-3 px-4 py-3.5 rounded-[10px] border border-ink-black/[0.06] hover:border-deep-space-violet/20 hover:bg-violet-muted transition-all group">
            <span className="text-[18px]">{a.icon}</span>
            <span className="text-[13px] font-medium text-ink-black tracking-[-0.01em] group-hover:text-deep-space-violet transition-colors">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Bills */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-deep-midnight tracking-[-0.02em]">Recent Bills</h2>
          <Link href="/bills" className="text-[13px] text-deep-space-violet font-medium hover:underline underline-offset-2">
            View all →
          </Link>
        </div>

        <div className="space-y-1.5">
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between px-4 py-3.5 rounded-[10px] hover:bg-surface-subtle transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-[8px] bg-ink-black/[0.03] group-hover:bg-violet-muted flex items-center justify-center transition-colors">
                  <span className="text-[14px]">📄</span>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-ink-black tracking-[-0.01em]">{bill.seller}</p>
                  <p className="text-[12px] text-muted-stone mt-0.5">
                    {bill.gstin ? (
                      <span className="font-[var(--font-mono)] text-[11px]">{bill.gstin.slice(0, 10)}...</span>
                    ) : (
                      <span className="text-warning">No GSTIN</span>
                    )}
                    <span className="mx-1.5 text-ink-black/20">·</span>
                    {bill.category}
                    <span className="mx-1.5 text-ink-black/20">·</span>
                    {bill.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-ink-black tracking-[-0.01em] tabular-nums">
                    ₹{bill.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-muted-stone mt-0.5">GST {bill.gstRate}%</p>
                </div>
                <Badge variant={bill.itc ? "success" : "error"}>
                  {bill.itc ? "ITC" : "Blocked"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
