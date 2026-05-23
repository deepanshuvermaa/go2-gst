import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceHTML } from "@/lib/invoice-pdf";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const html = generateInvoiceHTML(data);
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
