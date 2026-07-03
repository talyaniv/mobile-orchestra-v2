import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const START_DELAY_MS = Number(process.env.NEXT_PUBLIC_START_DELAY_MS ?? 3000);

async function parseBody(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await req.json().catch(() => ({}));
  }

  const form = await req.formData().catch(() => null);
  return form ? Object.fromEntries(form.entries()) : {};
}

export async function POST(req: NextRequest) {
  const body = await parseBody(req);

  if (!process.env.ORCHESTRA_PASS) {
    return NextResponse.json({ error: "ORCHESTRA_PASS is not configured" }, { status: 500 });
  }

  if (body.pass !== process.env.ORCHESTRA_PASS) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const serverNow = Date.now();
  const playAt = serverNow + START_DELAY_MS;
  await store.start(playAt);

  return NextResponse.json({ ok: true, serverNow, playAt });
}
