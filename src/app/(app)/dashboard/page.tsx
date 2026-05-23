"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";

const bills = [
  { id: "1", seller: "Amazon India", gstin: "27AABCU9603R1ZX", amount: 4999, gst: 18, date: "14 Nov", category: "Office Supplies", itc: true },
  { id: "2", seller: "Airtel Broadband", gstin: "06AARCA1234B1Z5", amount: 1180, gst: 18, date: "10 Nov", category: "Utilities", itc: true },
  { id: "3", seller: "Swiggy Business", gstin: "29AABCS1234C1Z8", amount: 890, gst: 5, date: "8 Nov", category: "Food & Beverage", itc: false },
  { id: "4", seller: "Uber India", gstin: "27AABCU1234D1Z2", amount: 340, gst: 5, date: "7 Nov", category: "Travel", itc: true },
  { id: "5", seller: "Ramesh Stationery", gstin: null, amount: 1240, gst: 18, date: "5 Nov", category: "Office Supplies", itc: false },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-[24px] font-semibold text-[#1a1a2e]">Dashboard</h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">November 2024 overview</p>
        </div>
        <Link href="/scan" className="h-[36px] px-4 bg-[#3b5bdb] text-white text-[13px] font-medium rounded-[10px] inline-flex items-center gap-1.5 hover:bg-[#4c6ef5] transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
          Scan Bill
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Expenses", value: "₹2,41,800", trend: "+12.4%", up: true },
          { label: "GST Paid", value: "₹43,524", trend: "Output tax", up: false },
          { label: "ITC Claimable", value: "₹38,190", trend: "+15.2%", up: true },
        ].map((card) => (
          <div key={card.label} className="rounded-[14px] bg-[#fcfcfc] border border-[#e2e8f0] p-5 hover:border-[#d6e4ff] transition-colors">
            <p className="text-[12px] font-medium text-[#94a3b8]">{card.label}</p>
            <p className="font-[var(--font-heading)] text-[26px] font-semibold text-[#1a1a2e] mt-2 tabular-nums">{card.value}</p>
            <div className="mt-2.5">
              {card.up ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#22c55e]">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9V3M3.5 5.5L6 3l2.5 2.5" /></svg>
                  {card.trend}
                </span>
              ) : (
                <span className="text-[11px] text-[#94a3b8]">{card.trend}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { href: "/scan", icon: "📷", label: "Scan Bill" },
          { href: "/reports", icon: "📊", label: "GSTR-1" },
          { href: "/reports", icon: "📋", label: "GSTR-3B" },
          { href: "/bills", icon: "📄", label: "All Bills" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="flex items-center gap-2.5 h-[44px] px-3.5 rounded-[10px] border border-[#e2e8f0] bg-[#fcfcfc] hover:bg-[#eef2fb] hover:border-[#d6e4ff] transition-all text-[13px] font-medium text-[#4a5568] hover:text-[#3b5bdb]">
            <span className="text-[15px]">{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Recent Bills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e]">Recent Bills</h2>
          <Link href="/bills" className="text-[12px] font-medium text-[#3b5bdb] hover:underline underline-offset-2">View all →</Link>
        </div>

        <div className="rounded-[14px] border border-[#e2e8f0] overflow-hidden">
          {bills.map((bill, i) => (
            <div key={bill.id} className={`flex items-center justify-between px-4 py-3.5 hover:bg-[#eef2fb] transition-colors cursor-pointer ${i < bills.length - 1 ? "border-b border-[#e2e8f0]" : ""}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-[8px] bg-[#eef2fb] flex items-center justify-center shrink-0">
                  <span className="text-[12px]">📄</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#1a1a2e] truncate">{bill.seller}</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5 truncate">
                    {bill.gstin ? <span className="font-[var(--font-mono)]">{bill.gstin.slice(0, 15)}</span> : <span className="text-[#f59e0b]">No GSTIN</span>}
                    <span className="mx-1">·</span>{bill.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#1a1a2e] tabular-nums">₹{bill.amount.toLocaleString("en-IN")}</p>
                  <p className="text-[11px] text-[#94a3b8]">GST {bill.gst}%</p>
                </div>
                <Badge variant={bill.itc ? "success" : "error"}>{bill.itc ? "ITC" : "Blocked"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
