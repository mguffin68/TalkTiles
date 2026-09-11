# TalkTiles

A locally-hosted, tap-to-speak AAC (Augmentative and Alternative Communication) board. Runs as an installable PWA on a tablet, speaks over the Web Speech API, and works fully offline once loaded — no cloud dependency, no accounts, no internet required to use it day to day.

## Run it with Docker

The easiest way to self-host TalkTiles — no Node.js install required, just Docker:

```bash
docker run -d \
  --name talktiles \
  -p 3001:3001 \
  -v talktiles-data:/app/data \
  ghcr.io/mguffin68/talktiles:latest
```

Then open `http://<this-machine's-address>:3001`. The container downloads the ARASAAC icon set on its first boot only (~330MB, one-time); the named volume keeps your boards, uploaded photos, and that icon cache across restarts and updates.

Or with Compose:

```yaml
services:
  talktiles:
    image: ghcr.io/mguffin68/talktiles:latest
    ports:
      - "3001:3001"
    volumes:
      - talktiles-data:/app/data
    restart: unless-stopped
volumes:
  talktiles-data:
```

To build from source instead of pulling the published image, clone this repo and run `docker compose up` — the included `docker-compose.yml` builds the image locally.

## Features

- **Grid-based communication boards** with folder navigation between categories (e.g. Food, People, Feelings), a persistent Home/Back header, and consistent color-coding by part of speech.
- **Tap-to-speak** with a **sentence strip** for building and speaking multi-word phrases, not just single words.
- **In-place editing** — add/edit/delete buttons and folders, assign an icon from the bundled ARASAAC symbol library or an uploaded photo, set custom spoken text distinct from the label.
- **Drag-and-drop** reordering, filing a button into a folder, and pulling one back out — all via an explicit Move handle so it never conflicts with tapping or editing.
- **PWA / offline-first** — the app shell and current board set are cached by a service worker, so it keeps working through a WiFi hiccup.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript, Vite, `vite-plugin-pwa` |
| Speech | Web Speech API (`speechSynthesis`) |
| Icons | Bundled [ARASAAC](https://arasaac.org) pictogram set, downloaded locally |
| Backend | Node/Express |
| Data | SQLite (boards/buttons) + local filesystem (uploaded photos, icon cache) |

## Running from source (for development)

Requires Node.js.

```bash
# Install dependencies
npm --prefix app install
npm --prefix backend install

# Download the ARASAAC icon set (one-time; ~330MB, not checked into git)
node backend/scripts/download-icons.js

# Run both dev servers (in separate terminals)
npm --prefix backend run dev   # http://localhost:3001
npm --prefix app run dev       # http://localhost:5173
```

Open `http://localhost:5173` for the tap-to-speak board, or `http://localhost:5173/edit` for Edit Mode. On an installed/home-screen PWA (which has no address bar), long-press the board title for about a second and a half to reach Edit Mode.

To use it from a tablet on the same WiFi network, open `http://<this-machine's-LAN-IP>:5173` instead of `localhost` (Vite's dev server binds to all interfaces via the `host: true` setting in `app/vite.config.ts`).

## Project structure

```
app/       React frontend (Vite + TypeScript)
backend/   Express API + SQLite storage
  data/    SQLite DB, uploaded photos, downloaded icons — all gitignored
```

## Licensing

The code in this repository is [MIT licensed](LICENSE). Icon pictograms are downloaded separately at setup time from [ARASAAC](https://arasaac.org), © Government of Aragón, licensed **CC BY-NC-SA** — noncommercial use only, and credit ARASAAC + Gobierno de Aragón if you share this further. The icon license is independent of and unaffected by the code's MIT license.
