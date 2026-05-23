import { NextRequest, NextResponse } from "next/server";
import { parseBankStatement } from "@/lib/bank-parser";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const parsed = parseBankStatement(text);
  return NextResponse.json(parsed);
}
