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

  // A persisted cue from an earlier performance must not start a participant
  // who has only just clicked Start. Only expose cues issued after this client
  // became ready.
  const playAt =
    client.ready && client.readyAt && state.playAt && state.playAt > client.readyAt
      ? state.playAt
      : null;

  return NextResponse.json({
    clientId: client.clientId,
    track: client.track,
    ready: client.ready,
    serverNow: Date.now(),
    playAt,
    message: playAt ? "play" : null,
  });
}
