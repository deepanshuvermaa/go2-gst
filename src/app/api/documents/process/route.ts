import { NextRequest, NextResponse } from "next/server";
import { ingestFromUpload, ingestFromEmail } from "@/lib/doc-ingest";
import { processDocument } from "@/lib/doc-pipeline";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  // Handle file upload
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string || "demo";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const doc = await ingestFromUpload(buffer, file.name, file.type);
    const result = await processDocument(doc);

    // Save to DB via transactions API
    if (result.extraction) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.extraction, userId, imageUrl: "" }),
      });
    }

    return NextResponse.json({
      success: true,
      documentId: result.id,
      ocrConfidence: result.ocrConfidence,
      classification: result.classification,
      extraction: result.extraction,
      validations: result.validations,
      processingTimeMs: result.processingTimeMs,
    });
  }

  // Handle email forwarding (raw email body)
  if (contentType.includes("message/rfc822") || contentType.includes("text/plain")) {
    const emailRaw = await req.text();
    const docs = await ingestFromEmail(emailRaw);
    const results = [];

    for (const doc of docs) {
      const result = await processDocument(doc);
      results.push({ documentId: result.id, fileName: result.fileName, classification: result.classification });
    }

    return NextResponse.json({ success: true, processed: results.length, documents: results });
  }

  return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
}
