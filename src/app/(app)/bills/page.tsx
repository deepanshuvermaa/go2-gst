"use client";

import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";

const bills = [
  { id: "1", seller: "Amazon India", gstin: "27AABCU9603R1ZX", amount: "₹4,999", gst: "₹763", rate: "18%", date: "14 Nov 2024", category: "Office Supplies", itc: true, confidence: 0.96 },
  { id: "2", seller: "Airtel Broadband", gstin: "06AARCA1234B1Z5", amount: "₹1,180", gst: "₹180", rate: "18%", date: "10 Nov 2024", category: "Utilities", itc: true, confidence: 0.94 },
  { id: "3", seller: "Swiggy Business", gstin: "29AABCS1234C1Z8", amount: "₹890", gst: "₹42", rate: "5%", date: "8 Nov 2024", category: "Food & Beverage", itc: false, confidence: 0.91 },
  { id: "4", seller: "Uber India", gstin: "27AABCU1234D1Z2", amount: "₹340", gst: "₹16", rate: "5%", date: "7 Nov 2024", category: "Travel", itc: true, confidence: 0.88 },
  { id: "5", seller: "Ramesh Stationery", gstin: null, amount: "₹1,240", gst: "₹189", rate: "18%", date: "5 Nov 2024", category: "Office Supplies", itc: false, confidence: 0.72 },
];

export default function BillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-[28px] leading-[1.13] tracking-[-0.84px] text-deep-midnight">
            Bills
          </h1>
          <p className="text-[14px] text-muted-stone mt-1 tracking-[-0.02em]">
            All extracted transactions
          </p>
        </div>
        <Link href="/scan">
          <Button variant="primary" size="sm">+ Scan New</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["All", "Tax Invoice", "Receipt", "Credit Note", "UPI"].map((filter, i) => (
          <button
            key={filter}
            className={`
              px-3 py-1.5 rounded-[100px] text-[13px] tracking-[-0.02em] whitespace-nowrap transition-colors
              ${i === 0
                ? "bg-deep-midnight text-canvas-white"
                : "bg-ink-black/[0.04] text-muted-stone hover:text-ink-black"
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Bills List */}
      <div className="space-y-2">
        {bills.map((bill) => (
          <Card key={bill.id} interactive className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-[8px] bg-ink-black/[0.04] flex items-center justify-center shrink-0">
                <span className="text-[16px]">📄</span>
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ink-black tracking-[-0.02em] truncate">
                  {bill.seller}
                </p>
                <p className="text-[12px] text-muted-stone tracking-[-0.02em] truncate">
                  {bill.gstin ? (
                    <span className="font-[var(--font-mono)] text-[11px]">{bill.gstin}</span>
                  ) : (
                    <span className="text-warning">No GSTIN</span>
                  )}
                  {" · "}{bill.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-[14px] font-medium text-ink-black tracking-[-0.02em]">{bill.amount}</p>
                <p className="text-[11px] text-muted-stone">GST {bill.gst} @ {bill.rate}</p>
              </div>
              <Badge variant={bill.itc ? "success" : "error"}>
                {bill.itc ? "ITC" : "Blocked"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
