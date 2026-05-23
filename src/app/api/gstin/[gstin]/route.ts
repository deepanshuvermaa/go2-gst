import { NextRequest, NextResponse } from "next/server";
import { lookupGSTIN } from "@/lib/gstin-lookup";

export async function GET(_: NextRequest, { params }: { params: Promise<{ gstin: string }> }) {
  const { gstin } = await params;
  if (!gstin || gstin.length !== 15) return NextResponse.json({ error: "Invalid GSTIN" }, { status: 400 });
  const details = await lookupGSTIN(gstin);
  if (!details) return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  return NextResponse.json(details);
}
