import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const clientId = body?.clientId;

  if (!clientId || typeof clientId !== "string") {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
  }

  const client = await store.ready(clientId);
  if (!client) return NextResponse.json({ error: "Unknown clientId" }, { status: 404 });

  return NextResponse.json({ ok: true, serverNow: Date.now() });
}
