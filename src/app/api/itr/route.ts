import { NextRequest, NextResponse } from "next/server";
import { computeITR, computeAdvanceTax } from "@/lib/itr";

export async function POST(req: NextRequest) {
  const input = await req.json();
  const result = computeITR(input);
  const advanceTax = computeAdvanceTax(result.recommended === "old" ? result.oldRegime.netTax : result.newRegime.netTax, input.tdsDeducted + input.advanceTaxPaid);
  return NextResponse.json({ ...result, advanceTax });
}
