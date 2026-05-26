import { NextRequest, NextResponse } from "next/server";
import { searchIndex } from "@/lib/doc-search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const category = req.nextUrl.searchParams.get("category") || undefined;
  const vendor = req.nextUrl.searchParams.get("vendor") || undefined;
  const dateFrom = req.nextUrl.searchParams.get("from") || undefined;
  const dateTo = req.nextUrl.searchParams.get("to") || undefined;
  const limit = Number(req.nextUrl.searchParams.get("limit") || 20);

  if (!q && !category && !vendor) {
    return NextResponse.json({ results: [], stats: searchIndex.getStats() });
  }

  const results = searchIndex.search(q || "*", { category, vendor, dateFrom, dateTo, limit });
  return NextResponse.json({ results, stats: searchIndex.getStats() });
}
