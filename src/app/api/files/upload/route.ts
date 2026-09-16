import { NextRequest, NextResponse } from "next/server";
import { uploadFile, validateFile, isR2Configured, MAX_FILE_SIZE } from "@/lib/storage/r2";

// Scope map — which logical folder a request may write to. Extend as features need.
const SCOPES = ["projects", "bids", "messages", "avatars", "portfolios"] as const;
type Scope = (typeof SCOPES)[number];

export async function POST(req: NextRequest) {
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "File storage is not configured." },
      { status: 503 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const scope = form.get("scope");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (typeof scope !== "string" || !SCOPES.includes(scope as Scope)) {
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
    }

    const check = validateFile(file);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 415 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(scope, {
      name: file.name,
      type: file.type,
      size: file.size,
      buffer,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
