import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateGSTR1 } from "@/lib/gstr1";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, gstin, month, year } = await req.json();
  if (!userId || !gstin || !month || !year) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const transactions = await db.transaction.findMany({
    where: { userId, invoiceDate: { gte: startDate, lte: endDate } },
    include: { lineItems: true },
  });

  const mapped = transactions.map((t) => ({
    id: t.id,
    sellerGstin: t.sellerGstin,
    buyerGstin: t.buyerGstin,
    buyerState: t.buyerState,
    buyerStateCode: t.buyerStateCode,
    sellerStateCode: t.sellerStateCode,
    invoiceNumber: t.invoiceNumber,
    invoiceDate: t.invoiceDate,
    supplyType: t.supplyType,
    reverseCharge: t.reverseCharge,
    grandTotal: Number(t.grandTotal || 0),
    subtotal: Number(t.subtotal || 0),
    totalCgst: Number(t.totalCgst || 0),
    totalSgst: Number(t.totalSgst || 0),
    totalIgst: Number(t.totalIgst || 0),
    totalCess: Number(t.totalCess || 0),
    documentType: t.documentType,
    lineItems: t.lineItems.map((li) => ({
      hsnCode: li.hsnCode,
      sacCode: li.sacCode,
      taxableValue: Number(li.taxableValue || 0),
      gstRatePercent: Number(li.gstRatePercent || 0),
      cgstAmount: Number(li.cgstAmount || 0),
      sgstAmount: Number(li.sgstAmount || 0),
      igstAmount: Number(li.igstAmount || 0),
      cessAmount: Number(li.cessAmount || 0),
      quantity: Number(li.quantity || 0),
      unit: li.unit,
    })),
  }));

  const fp = `${String(month).padStart(2, "0")}${year}`;
  const gstr1 = generateGSTR1(gstin, fp, mapped);

  return NextResponse.json(gstr1);
}
