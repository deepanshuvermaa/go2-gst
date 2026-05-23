import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getVendorDirectory, detectDuplicates } from "@/lib/vendor-pl";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const vendors = await getVendorDirectory(userId);
  return NextResponse.json({ vendors });
}

export async function POST(req: NextRequest) {
  const { userId, action } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  if (action === "duplicates") {
    const duplicates = await detectDuplicates(userId);
    return NextResponse.json({ duplicates });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
