import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "No token" }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const phone = decoded.phone_number;
    if (!phone) {
      return NextResponse.json({ error: "No phone in token" }, { status: 400 });
    }

    // Upsert user
    const user = await db.user.upsert({
      where: { phone },
      update: { updatedAt: new Date() },
      create: { phone },
    });

    // Create session
    const session = await db.session.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    const res = NextResponse.json({ success: true, user: { id: user.id, phone: user.phone, name: user.name } });
    res.cookies.set("session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Auth failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
