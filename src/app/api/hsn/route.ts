import { NextRequest, NextResponse } from "next/server";
import { searchHSN } from "@/lib/hsn";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = searchHSN(q, 10);
  return NextResponse.json({ results });
}
