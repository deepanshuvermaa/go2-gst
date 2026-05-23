import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeGSTR3B } from "@/lib/gstr3b";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, month, year } = await req.json();
  if (!userId || !month || !year) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const transactions = await db.transaction.findMany({
    where: { userId, invoiceDate: { gte: startDate, lte: endDate } },
  });

  const mapped = transactions.map((t) => ({
    documentType: t.documentType,
    supplyType: t.supplyType,
    reverseCharge: t.reverseCharge,
    totalCgst: Number(t.totalCgst || 0),
    totalSgst: Number(t.totalSgst || 0),
    totalIgst: Number(t.totalIgst || 0),
    totalCess: Number(t.totalCess || 0),
    subtotal: Number(t.subtotal || 0),
    itcEligible: t.itcEligible,
    itcType: t.itcType,
    itcBlockedReason: t.itcBlockedReason,
    transactionDirection: t.transactionDirection,
  }));

  const sales = mapped.filter((t) => t.transactionDirection === "INCOME");
  const purchases = mapped.filter((t) => t.transactionDirection === "EXPENSE");
  const summary = computeGSTR3B(sales, purchases);

  return NextResponse.json(summary);
}
