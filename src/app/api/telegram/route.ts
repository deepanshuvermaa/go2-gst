import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { id: number; first_name?: string };
    text?: string;
    photo?: Array<{ file_id: string; file_size?: number }>;
    document?: { file_id: string; mime_type?: string };
  };
}

export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json();
    const msg = update.message;
    if (!msg) return NextResponse.json({ ok: true });

    const chatId = msg.chat.id;

    // Handle text commands
    if (msg.text) {
      const cmd = msg.text.toLowerCase().trim();
      if (cmd === "/start") {
        await sendMessage(chatId, "👋 Welcome to Go2GST!\n\nSend me a photo of any bill or invoice and I'll extract all GST data instantly.\n\nCommands:\n/scan — Send a bill photo\n/report — Monthly summary\n/help — All commands");
        return NextResponse.json({ ok: true });
      }
      if (cmd === "/help") {
        await sendMessage(chatId, "📋 Commands:\n\n📸 Send a photo — Extract GST data\n/report — Monthly GST summary\n/itc — ITC claimable this month\n/gstr1 — Download GSTR-1 JSON\n/settings — Link your account");
        return NextResponse.json({ ok: true });
      }
      await sendMessage(chatId, "📸 Send me a photo of a bill to extract GST data.");
      return NextResponse.json({ ok: true });
    }

    // Handle photo
    if (msg.photo && msg.photo.length > 0) {
      // Get highest resolution photo
      const photo = msg.photo[msg.photo.length - 1];
      await sendMessage(chatId, "⏳ Processing your bill...");

      // Download file from Telegram
      const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${photo.file_id}`);
      const fileData = await fileRes.json();
      const filePath = fileData.result?.file_path;

      if (!filePath) {
        await sendMessage(chatId, "❌ Could not download the image. Please try again.");
        return NextResponse.json({ ok: true });
      }

      const imageRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      const base64 = imageBuffer.toString("base64");

      // Call our extraction API
      const extractRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!extractRes.ok) {
        await sendMessage(chatId, "❌ Extraction failed. Please try with a clearer photo.");
        return NextResponse.json({ ok: true });
      }

      const { data } = await extractRes.json();

      // Format reply
      const reply = formatExtractionReply(data);
      await sendMessage(chatId, reply);
      return NextResponse.json({ ok: true });
    }

    await sendMessage(chatId, "📸 Please send a photo of your bill or invoice.");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

function formatExtractionReply(data: Record<string, unknown>): string {
  const seller = data.seller as Record<string, unknown> | null;
  const totals = data.totals as Record<string, unknown> | null;
  const itc = data.itc as Record<string, unknown> | null;

  const sellerName = seller?.name || "Unknown Seller";
  const gstin = seller?.gstin || "No GSTIN";
  const gstinStatus = seller?.gstin_valid ? "✅" : "⚠️";
  const grandTotal = totals?.grand_total != null ? `₹${Number(totals.grand_total).toLocaleString("en-IN")}` : "—";
  const totalTax = totals?.total_tax != null ? `₹${Number(totals.total_tax).toLocaleString("en-IN")}` : "—";
  const itcStatus = itc?.eligible ? "✅ Eligible" : "❌ Blocked";
  const category = (data.suggested_category as string) || "Uncategorized";

  return `✅ <b>Bill Saved!</b>

🏪 ${sellerName}
📋 GSTIN: <code>${gstin}</code> ${gstinStatus}
💰 ${grandTotal} (GST ${totalTax})
📅 ${(data.invoice_date as string) || "—"}
📁 ${category}
${itcStatus}

Reply /edit to change category`;
}
