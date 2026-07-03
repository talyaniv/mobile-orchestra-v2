import { store } from "@/lib/store";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST() {
  const clientId = uuidv4();
  const client = await store.join(clientId);

  return NextResponse.json({
    clientId: client.clientId,
    track: client.track,
    serverNow: Date.now(),
  });
}
