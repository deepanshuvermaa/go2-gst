import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateTallyXML, transactionToTallyVoucher } from "@/lib/tally-bulk";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId, month, year } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const transactions = await db.transaction.findMany({
    where: { userId, invoiceDate: { gte: startDate, lte: endDate } },
  });

  const vouchers = transactions.map((t) => transactionToTallyVoucher({
    invoiceDate: t.invoiceDate?.toISOString().split("T")[0] || "",
    sellerName: t.sellerName || "Unknown",
    invoiceNumber: t.invoiceNumber || "",
    grandTotal: Number(t.grandTotal || 0),
    subtotal: Number(t.subtotal || 0),
    totalCgst: Number(t.totalCgst || 0),
    totalSgst: Number(t.totalSgst || 0),
    totalIgst: Number(t.totalIgst || 0),
    category: t.category || "other",
    transactionDirection: t.transactionDirection,
    sellerGstin: t.sellerGstin || undefined,
  }));

  const xml = generateTallyXML(vouchers);
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml", "Content-Disposition": `attachment; filename="tally-export-${month}-${year}.xml"` } });
}
