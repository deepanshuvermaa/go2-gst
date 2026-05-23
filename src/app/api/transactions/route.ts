import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const month = Number(req.nextUrl.searchParams.get("month") || new Date().getMonth() + 1);
  const year = Number(req.nextUrl.searchParams.get("year") || new Date().getFullYear());
  const limit = Number(req.nextUrl.searchParams.get("limit") || 50);

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const [transactions, summary] = await Promise.all([
    db.transaction.findMany({
      where: { userId, invoiceDate: { gte: startDate, lte: endDate } },
      include: { lineItems: true },
      orderBy: { invoiceDate: "desc" },
      take: limit,
    }),
    db.transaction.aggregate({
      where: { userId, invoiceDate: { gte: startDate, lte: endDate } },
      _sum: { grandTotal: true, totalCgst: true, totalSgst: true, totalIgst: true, totalCess: true, subtotal: true },
      _count: true,
    }),
  ]);

  const itcTotal = await db.transaction.aggregate({
    where: { userId, invoiceDate: { gte: startDate, lte: endDate }, itcEligible: true },
    _sum: { totalCgst: true, totalSgst: true, totalIgst: true },
  });

  return NextResponse.json({
    transactions,
    summary: {
      totalExpenses: Number(summary._sum.grandTotal || 0),
      totalGST: Number(summary._sum.totalCgst || 0) + Number(summary._sum.totalSgst || 0) + Number(summary._sum.totalIgst || 0),
      itcClaimable: Number(itcTotal._sum.totalCgst || 0) + Number(itcTotal._sum.totalSgst || 0) + Number(itcTotal._sum.totalIgst || 0),
      billCount: summary._count,
    },
  });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const transaction = await db.transaction.create({
    data: {
      userId: data.userId,
      organizationId: data.organizationId || null,
      documentType: data.document_type?.toUpperCase().replace(/ /g, "_") || "TAX_INVOICE",
      invoiceNumber: data.invoice_number,
      invoiceDate: data.invoice_date ? new Date(data.invoice_date) : null,
      financialYear: data.financial_year,
      sellerName: data.seller?.name,
      sellerGstin: data.seller?.gstin,
      sellerGstinValid: data.seller?.gstin_valid,
      sellerPan: data.seller?.pan,
      sellerCity: data.seller?.city,
      sellerState: data.seller?.state,
      sellerStateCode: data.seller?.state_code,
      buyerName: data.buyer?.name,
      buyerGstin: data.buyer?.gstin,
      buyerGstinValid: data.buyer?.gstin_valid,
      buyerState: data.buyer?.state,
      buyerStateCode: data.buyer?.state_code,
      placeOfSupply: data.place_of_supply,
      placeOfSupplyCode: data.place_of_supply_code,
      supplyType: data.supply_type?.toUpperCase().replace(/ /g, "_") || null,
      reverseCharge: data.reverse_charge || false,
      irn: data.irn,
      ewbNumber: data.ewb_number,
      subtotal: data.totals?.subtotal,
      totalDiscount: data.totals?.total_discount,
      totalCgst: data.totals?.total_cgst,
      totalSgst: data.totals?.total_sgst,
      totalIgst: data.totals?.total_igst,
      totalCess: data.totals?.total_cess,
      totalTax: data.totals?.total_tax,
      roundOff: data.totals?.round_off,
      grandTotal: data.totals?.grand_total,
      tdsApplicable: data.tds?.applicable || false,
      tdsSection: data.tds?.section,
      tdsAmount: data.tds?.amount,
      itcEligible: data.itc?.eligible,
      itcType: data.itc?.type,
      itcBlockedReason: data.itc?.blocked_reason,
      extractionConfidence: data.confidence,
      amountsMatchCheck: data.amounts_match_check,
      category: data.suggested_category,
      transactionDirection: data.transaction_direction?.toUpperCase() || "EXPENSE",
      paymentMode: data.payment?.payment_mode,
      bankName: data.payment?.bank_name,
      ifsc: data.payment?.ifsc,
      imageUrl: data.imageUrl,
      lineItems: {
        create: (data.line_items || []).map((item: Record<string, unknown>, i: number) => ({
          slNo: i + 1,
          description: item.description as string,
          hsnCode: item.hsn_code as string,
          sacCode: item.sac_code as string,
          productType: (item.product_type as string)?.toUpperCase() || null,
          quantity: item.quantity as number,
          unit: item.unit as string,
          unitPrice: item.unit_price as number,
          discountPercent: item.discount_percent as number,
          discountAmount: item.discount_amount as number,
          taxableValue: item.taxable_value as number,
          gstRatePercent: item.gst_rate_percent as number,
          cgstRate: item.cgst_rate as number,
          cgstAmount: item.cgst_amount as number,
          sgstRate: item.sgst_rate as number,
          sgstAmount: item.sgst_amount as number,
          igstRate: item.igst_rate as number,
          igstAmount: item.igst_amount as number,
          cessRate: item.cess_rate as number,
          cessAmount: item.cess_amount as number,
          lineTotal: item.line_total as number,
        })),
      },
    },
    include: { lineItems: true },
  });

  return NextResponse.json({ success: true, transaction });
}
