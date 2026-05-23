import { NextRequest, NextResponse } from "next/server";
import { inviteClient, getCAClients, getClientSummary, createOrganization } from "@/lib/ca-portal";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const caUserId = req.nextUrl.searchParams.get("caUserId");
  if (!caUserId) return NextResponse.json({ error: "Missing caUserId" }, { status: 400 });
  const clients = await getCAClients(caUserId);
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const { action, caUserId, ...data } = await req.json();
  if (!caUserId) return NextResponse.json({ error: "Missing caUserId" }, { status: 400 });

  if (action === "invite") {
    const client = await inviteClient(caUserId, data.phone, data.name);
    return NextResponse.json({ client });
  }
  if (action === "createOrg") {
    const org = await createOrganization(caUserId, data.name, data.gstin);
    return NextResponse.json({ org });
  }
  if (action === "clientSummary") {
    const summary = await getClientSummary(caUserId, data.clientId, data.month, data.year);
    return NextResponse.json(summary);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
