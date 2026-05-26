"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";

interface Transaction {
  id: string;
  sellerName: string | null;
  sellerGstin: string | null;
  grandTotal: string | null;
  totalCgst: string | null;
  totalSgst: string | null;
  totalIgst: string | null;
  invoiceDate: string | null;
  category: string | null;
  itcEligible: boolean | null;
  documentType: string;
}

interface Summary {
  totalExpenses: number;
  totalGST: number;
  itcClaimable: number;
  billCount: number;
}

const MOCK_BILLS: Transaction[] = [
  { id: "1", sellerName: "Amazon India", sellerGstin: "27AABCU9603R1ZX", grandTotal: "4999", totalCgst: null, totalSgst: null, totalIgst: "763", invoiceDate: "2024-11-14", category: "Office Supplies", itcEligible: true, documentType: "TAX_INVOICE" },
  { id: "2", sellerName: "Airtel Broadband", sellerGstin: "06AARCA1234B1Z5", grandTotal: "1180", totalCgst: "90", totalSgst: "90", totalIgst: null, invoiceDate: "2024-11-10", category: "Utilities", itcEligible: true, documentType: "TAX_INVOICE" },
  { id: "3", sellerName: "Swiggy Business", sellerGstin: "29AABCS1234C1Z8", grandTotal: "890", totalCgst: "21", totalSgst: "21", totalIgst: null, invoiceDate: "2024-11-08", category: "Food & Beverage", itcEligible: false, documentType: "TAX_INVOICE" },
  { id: "4", sellerName: "Uber India", sellerGstin: "27AABCU1234D1Z2", grandTotal: "340", totalCgst: null, totalSgst: null, totalIgst: "16", invoiceDate: "2024-11-07", category: "Travel", itcEligible: true, documentType: "TAX_INVOICE" },
  { id: "5", sellerName: "Ramesh Stationery", sellerGstin: null, grandTotal: "1240", totalCgst: "95", totalSgst: "95", totalIgst: null, invoiceDate: "2024-11-05", category: "Office Supplies", itcEligible: false, documentType: "RECEIPT" },
];

const MOCK_SUMMARY: Summary = { totalExpenses: 241800, totalGST: 43524, itcClaimable: 38190, billCount: 47 };

export default function DashboardPage() {
  const [bills, setBills] = useState<Transaction[]>(MOCK_BILLS);
  const [summary, setSummary] = useState<Summary>(MOCK_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/transactions?userId=demo&month=11&year=2024");
        if (res.ok) {
          const data = await res.json();
          if (data.transactions?.length > 0) {
            setBills(data.transactions);
            setSummary(data.summary);
          }
        }
      } catch { /* use mock */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-8" id="tour-dashboard">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-[24px] font-semibold text-[#1a1a2e]">Dashboard</h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">{loading ? "Loading..." : `${summary.billCount} bills this month`}</p>
        </div>
        <Link href="/scan" className="h-[36px] px-4 bg-[#3b5bdb] text-white text-[13px] font-medium rounded-[10px] inline-flex items-center gap-1.5 hover:bg-[#4c6ef5] transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
          Scan Bill
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="tour-summary">
        <div className="rounded-[14px] bg-[#fcfcfc] border border-[#e2e8f0] p-5 hover:border-[#d6e4ff] transition-colors">
          <p className="text-[12px] font-medium text-[#94a3b8]">Total Expenses</p>
          <p className="font-[var(--font-heading)] text-[26px] font-semibold text-[#1a1a2e] mt-2 tabular-nums">{formatINR(summary.totalExpenses)}</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#22c55e] mt-2">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9V3M3.5 5.5L6 3l2.5 2.5" /></svg>
            12.4%
          </span>
        </div>
        <div className="rounded-[14px] bg-[#fcfcfc] border border-[#e2e8f0] p-5 hover:border-[#d6e4ff] transition-colors">
          <p className="text-[12px] font-medium text-[#94a3b8]">GST Paid</p>
          <p className="font-[var(--font-heading)] text-[26px] font-semibold text-[#1a1a2e] mt-2 tabular-nums">{formatINR(summary.totalGST)}</p>
          <span className="text-[11px] text-[#94a3b8] mt-2 inline-block">Output tax</span>
        </div>
        <div className="rounded-[14px] bg-[#fcfcfc] border border-[#e2e8f0] p-5 hover:border-[#d6e4ff] transition-colors">
          <p className="text-[12px] font-medium text-[#94a3b8]">ITC Claimable</p>
          <p className="font-[var(--font-heading)] text-[26px] font-semibold text-[#1a1a2e] mt-2 tabular-nums">{formatINR(summary.itcClaimable)}</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#22c55e] mt-2">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9V3M3.5 5.5L6 3l2.5 2.5" /></svg>
            15.2%
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="tour-actions">
        {[
          { href: "/scan", icon: "📷", label: "Scan Bill" },
          { href: "/reports", icon: "📊", label: "GSTR-1" },
          { href: "/reports", icon: "📋", label: "GSTR-3B" },
          { href: "/bills", icon: "📄", label: "All Bills" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="flex items-center gap-2.5 h-[44px] px-3.5 rounded-[10px] border border-[#e2e8f0] bg-[#fcfcfc] hover:bg-[#eef2fb] hover:border-[#d6e4ff] transition-all text-[13px] font-medium text-[#4a5568] hover:text-[#3b5bdb]">
            <span className="text-[15px]">{a.icon}</span>{a.label}
          </Link>
        ))}
      </div>

      {/* Recent Bills */}
      <div id="tour-bills">
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
                  <p className="text-[13px] font-medium text-[#1a1a2e] truncate">{bill.sellerName || "Unknown"}</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5 truncate">
                    {bill.sellerGstin ? <span className="font-[var(--font-mono)]">{bill.sellerGstin}</span> : <span className="text-[#f59e0b]">No GSTIN</span>}
                    <span className="mx-1">·</span>{formatDate(bill.invoiceDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-[13px] font-semibold text-[#1a1a2e] tabular-nums">₹{Number(bill.grandTotal || 0).toLocaleString("en-IN")}</p>
                <Badge variant={bill.itcEligible ? "success" : "error"}>{bill.itcEligible ? "ITC" : "Blocked"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
