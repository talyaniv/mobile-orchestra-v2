# Mobile Orchestra — Next.js polling rewrite, original UI

This version keeps the original app's visible structure/texts as closely as possible:

- client page uses the same full-screen color background
- Start button text: `Click to start / לחצו להתחלה`
- ready state uses the grid animation
- playing state uses the ripple animation
- done state shows `תודה רבה! / Thanks!`
- MC page is the same simple `pass` + `ok` form at `/mbo/start`

Socket.IO was replaced with polling:

- `POST /api/join` assigns a track
- `POST /api/ready` marks a client ready after the Start tap unlocks audio
- `GET /api/state?clientId=...` is polled by ready clients
- `POST /api/start` schedules playback a few seconds in the future

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open from another phone/device on the LAN:

```txt
http://YOUR_COMPUTER_IP:3000
```

MC page:

```txt
http://YOUR_COMPUTER_IP:3000/mbo/start
```

The `dev` script uses `next dev -H 0.0.0.0` so other devices on the LAN can connect.

## Important: audio files

The original repository contains the real audio files in `public/track-1.mp3` ... `public/track-6.mp3`.

This generated zip includes tiny silent placeholder mp3 files so the app can be tested without browser audio errors.
Replace them with your real files:

```txt
public/track-1.mp3
public/track-2.mp3
public/track-3.mp3
public/track-4.mp3
public/track-5.mp3
public/track-6.mp3
```

If you see a message like `Audio could not be loaded`, the requested `public/track-N.mp3` file is missing or the browser cannot play it.

## Vercel

For Vercel/production, configure Upstash Redis:

```txt
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
ORCHESTRA_PASS=...
```

Without Redis, the app uses in-memory state, which is only reliable for local/single-process runs.
