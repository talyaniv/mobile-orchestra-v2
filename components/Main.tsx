"use client";

import { useEffect, useRef, useState } from "react";
import Start from "./Start";
import Grid from "./Grid";
import Playing from "./Playing";
import Thanks from "./Thanks";

type PlayerStatus = "idle" | "ready" | "playing" | "done";
type JoinResponse = { clientId: string; track: number; serverNow: number };
type StateResponse = {
  clientId: string;
  track: number;
  ready: boolean;
  serverNow: number;
  playAt: number | null;
  message: "play" | null;
};

const POLL_MS = Number(process.env.NEXT_PUBLIC_POLL_MS ?? 500);
const FALLBACK_COLORS = ["#FF1744", "#D500F9", "#3D5AFE", "#00B0FF", "#00C853", "#FFD600"];

function getTrackColors() {
  try {
    const parsed = JSON.parse(process.env.NEXT_PUBLIC_TRACK_COLORS ?? "[]");
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK_COLORS;
  } catch {
    return FALLBACK_COLORS;
  }
}

export default function Main() {
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const [playTrack, setPlayTrack] = useState("idle");
  const [clientId, setClientId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#000");
  const [debugError, setDebugError] = useState("");
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const hasScheduledPlay = useRef(false);
  const playTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackColors = useRef(getTrackColors()).current;

  useEffect(() => {
    let cancelled = false;

    async function join() {
      const res = await fetch("/api/join", { method: "POST" });
      const data = (await res.json()) as JoinResponse;

      if (!res.ok) {
        setDebugError("Could not join orchestra");
        return;
      }

      if (cancelled) return;

      setClientId(data.clientId);
      setBgColor(trackColors[data.track - 1] ?? "#000");
      setPlayTrack(`/track-${data.track}.mp3`);
    }

    join().catch((err) => {
      console.error(err);
      setDebugError("Could not join orchestra");
    });

    return () => {
      cancelled = true;
      if (playTimeout.current) clearTimeout(playTimeout.current);
    };
  }, [trackColors]);

  async function play() {
    if (!audioPlayer.current || !clientId || playTrack === "idle") {
      return;
    }

    setDebugError("");

    try {
      const audio = audioPlayer.current;

      // Make sure the browser starts loading the source before the unlock attempt.
      audio.load();

      // Original app behavior: start audio from direct user interaction,
      // then immediately pause it so the later programmatic playback is allowed.
      audio.muted = true;
      await audio.play();

      setPlayerStatus("ready");

      setTimeout(() => {
        if (!audioPlayer.current) return;
        audioPlayer.current.pause();
        audioPlayer.current.currentTime = 0;
        audioPlayer.current.muted = false;
      }, 80);

      await fetch("/api/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
    } catch (err) {
      console.error(err);

      const audioErrorCode = audioPlayer.current?.error?.code;
      if (audioErrorCode) {
        setDebugError(
          `Audio could not be loaded. Make sure public${playTrack} exists and is a browser-playable mp3.`
        );
      } else {
        setDebugError(err instanceof Error ? err.message : "Audio start failed");
      }
    }
  }

  useEffect(() => {
    if (!clientId || playerStatus !== "ready") return;

    let cancelled = false;

    async function poll() {
      if (cancelled || !clientId || hasScheduledPlay.current) return;

      const requestStart = Date.now();

      try {
        const res = await fetch(`/api/state?clientId=${encodeURIComponent(clientId)}`, {
          cache: "no-store",
        });
        const requestEnd = Date.now();
        const data = (await res.json()) as StateResponse;

        if (!res.ok) return;

        if (data.message === "play" && data.playAt && !hasScheduledPlay.current) {
          hasScheduledPlay.current = true;

          const rtt = requestEnd - requestStart;
          const estimatedServerNowAtResponse = data.serverNow + rtt / 2;
          const serverOffset = estimatedServerNowAtResponse - requestEnd;
          const localPlayAt = data.playAt - serverOffset;
          const delay = Math.max(0, localPlayAt - Date.now());

          playTimeout.current = setTimeout(async () => {
            if (!audioPlayer.current) return;
            audioPlayer.current.muted = false;
            audioPlayer.current.currentTime = 0;
            setPlayerStatus("playing");
            await audioPlayer.current.play();
          }, delay);
        }
      } catch (err) {
        console.error(err);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [clientId, playerStatus]);

  return (
    <div className="App">
      <header className="App-header" style={{ backgroundColor: bgColor }}>
        <audio
          style={{ display: "none" }}
          ref={audioPlayer}
          preload="auto"
          src={playTrack === "idle" ? undefined : playTrack}
          title={playTrack}
          onPlay={() => setPlayerStatus("playing")}
          onEnded={() => setPlayerStatus("done")}
        >
          <p>
            Your browser does not support the <code>audio</code> element.
          </p>
        </audio>

        <Start show={playerStatus === "idle"} callback={play} />
        <Grid show={playerStatus === "ready"} />
        <Playing show={playerStatus === "playing"} />
        <Thanks show={playerStatus === "done"} />

        {debugError && <div className="debug-error">{debugError}</div>}
      </header>
    </div>
  );
}
