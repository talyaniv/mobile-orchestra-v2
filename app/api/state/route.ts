import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
  }

  const [client, state] = await Promise.all([store.getClient(clientId), store.getState()]);
  if (!client) return NextResponse.json({ error: "Unknown clientId" }, { status: 404 });

  return NextResponse.json({
    clientId: client.clientId,
    track: client.track,
    ready: client.ready,
    serverNow: Date.now(),
    playAt: state.playAt,
    message: state.playAt ? "play" : null,
  });
}
