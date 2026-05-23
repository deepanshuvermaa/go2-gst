import { NextRequest, NextResponse } from "next/server";
import { getMonthlyPL } from "@/lib/vendor-pl";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const month = Number(req.nextUrl.searchParams.get("month"));
  const year = Number(req.nextUrl.searchParams.get("year"));
  if (!userId || !month || !year) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  const pl = await getMonthlyPL(userId, month, year);
  return NextResponse.json(pl);
}
