# Mobile Orchestra — Next.js polling rewrite

This is an updated version of [the original Mobile Orchestra](https://github.com/talyaniv/mobile-orchestra). While the original one splits the code between React client and Node/Express.js server, this one uses Next.JS to consolidate both into one code base. This makes it easier to deploy in Next.js ready platforms such as [Vercel](https://vercel.com).

The app currently runs live in Vercel at [m.croptal.com](https://m.croptal.com)

This version keeps the original app's visible structure/texts as closely as possible:

- client page uses the same full-screen color background
- Start button text: `Click to start / לחצו להתחלה`
- ready state uses the grid animation
- playing state uses the ripple animation
- done state shows `תודה רבה! / Thanks!`
- MC page keeps the same simple `pass` + `ok` form at `/mbo/start`, but adds a `reset` button to start a new session.

Socket.IO was replaced with polling:

- `POST /api/join` assigns a track
- `POST /api/ready` marks a client ready after the Start tap unlocks audio
- `GET /api/state?clientId=...` is polled by ready clients
- `POST /api/start` schedules playback a few seconds in the future

## Environment Variables

See `.env.example`. All variables are optional. Update and copy it to your flavor into `.env` or `.env.local`. Create/update the environment variables in the production app when using managed services such as Vercel.

`NEXT_PUBLIC_TRACK_COLORS`: a list of colors to use for each track.
`ORCHESTRA_PASS`: MC's password for session management. Optional, defaults to "1234".


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

You may replace the original audio files with your ones:

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

For Vercel/production, connect an Upstash Redis. It will automatically add the relevant environment variables.

```txt
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
ORCHESTRA_PASS=...
```

Without Redis, the app uses in-memory state, which is only reliable for local/single-process runs.
