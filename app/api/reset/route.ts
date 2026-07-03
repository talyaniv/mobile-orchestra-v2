import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!process.env.ORCHESTRA_PASS) {
    return NextResponse.json({ error: "ORCHESTRA_PASS is not configured" }, { status: 500 });
  }

  if (body?.pass !== process.env.ORCHESTRA_PASS) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await store.reset();
  return NextResponse.json({ ok: true, serverNow: Date.now() });
}
