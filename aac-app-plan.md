# Locally-Hosted AAC App — Build Plan

## 1. AAC Design Principles (read this before designing screens)

These aren't optional nice-to-haves — they're what makes an AAC system actually usable long-term:

- **Consistent motor planning.** Once a button is somewhere, don't move it. Kids build muscle memory for *where* words are, not just what they look like. Editing content in place is fine; reshuffling grids isn't.
- **Core + fringe vocabulary.** "Core words" (I, want, go, more, stop, like, help, yes, no, etc.) make up ~80% of what people actually say and should always be visible/reachable in 1-2 taps. "Fringe words" (specific nouns — foods, toys, people) live in folders/categories.
- **Consistent color-coding by part of speech** is a common convention (e.g., verbs = green, nouns = orange/yellow, pronouns = yellow, social words = pink, describing words = blue). Not mandatory, but worth adopting early since it helps navigation become automatic.
- **Low tap-depth.** Ideally no more than 2-3 taps to reach any word from the home screen.
- **Big, forgiving touch targets.** Design for imprecise taps — generous button size and spacing, no hover-dependent interactions.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React PWA (installable, offline-capable) | Runs like a native app on a tablet; no app store, no cloud dependency |
| Speech synthesis | Web Speech API (`speechSynthesis`) baseline | Free, built into every modern browser, zero setup, works offline |
| Speech (optional upgrade) | Piper TTS in a Docker container | Much more natural voice quality than most OS voices; still fully local/offline; can even train/pick a child-friendly voice |
| Icon library | ARASAAC symbol set (bundled locally) | Open license (CC BY-NC-SA), purpose-built for AAC, 15,000+ consistent-style pictograms, downloadable in bulk for offline use |
| Custom images | User upload → stored locally, auto-cropped/resized | For photos of family, favorite objects, familiar places |
| Data storage | SQLite (boards, buttons, folder structure) + local filesystem (images) | Single-user, no need for a heavier DB; easy to back up as one file + one folder |
| Backend | Lightweight Node/Express or Python/FastAPI | Serves the API, handles image upload/resize, optionally proxies TTS requests to Piper |
| Deployment | Docker Compose (matches your existing self-hosted setup) | One `docker-compose up`, accessible to any tablet on your LAN |

## 3. Architecture

```
[Tablet browser, PWA installed]
        |
        | HTTP (LAN only, or via your reverse proxy if you want remote access)
        v
[Frontend: React PWA] --- static assets cached for offline use
        |
        v
[Backend API] --- /boards, /buttons, /images, /speak
        |                                  |
        v                                  v
   [SQLite DB]                    [Piper TTS container] (optional)
        |
        v
   [Local image storage]
```

Keep the frontend able to function **fully offline** once the initial load happens — this matters a lot for a communication device; it can't go down because the WiFi hiccups. Service worker caches the app shell + current board set; sync back to the backend when a change is made.

## 4. Core Features (MVP)

1. **Grid-based communication board** — configurable rows/columns per board, tap a button → speaks the word/phrase and (optionally) shows the text on screen.
2. **Board/folder navigation** — a home board with core vocabulary + folder buttons that open category boards (Food, People, Feelings, Activities, etc.), with a persistent "home" and "back" button on every screen.
3. **Button editor** — assign icon (from library or uploaded photo), label text, spoken text (can differ from label), color, and destination (speak word vs. navigate to a folder).
4. **Icon library browser** — searchable ARASAAC library, drag/tap to assign to a button.
5. **Image upload** — take/upload a photo, auto-crop to square, use as a button icon.
6. **Speech synthesis** — Web Speech API by default; adjustable rate/pitch; sentence-building bar (tap multiple words, then speak the whole sentence at once) is a big usability win once he's combining words.
7. **Layout customization** — grid size per board, button size, color-coding scheme.

## 5. Phase 2 (once MVP is solid)

- **Sentence strip** — build multi-word phrases before speaking, with a "clear" and "speak all" button.
- **Word prediction / quick fringe suggestions** based on recently used or time-of-day (e.g., meal-time board surfaces automatically at breakfast).
- **Multiple user profiles/boards** if useful for school vs. home versions.
- **Switch scanning / row-column scanning mode** — only needed if tapping precision becomes a barrier; auto-highlights rows then columns for single-switch access.
- **Backup/export** — one-click export of the whole board set + images (a zip), for peace of mind and for sharing with school/therapists.
- **Piper TTS integration** for a warmer/more natural voice than default OS voices.

## 6. Suggested Build Order

1. Static board renderer + Web Speech API tap-to-speak (hardcode a couple of boards) — get the core loop working end to end.
2. Backend + SQLite for boards/buttons, replace hardcoded data.
3. Button editor UI (add/edit/delete buttons, assign icons/colors).
4. Bulk-import ARASAAC icon set, build a searchable picker.
5. Image upload + crop for custom photos.
6. PWA-ify: manifest, service worker, offline caching.
7. Sentence strip.
8. Docker Compose packaging for one-command deploy on your server.
9. (Optional) Piper TTS container + voice selection.

## 7. Notes on Licensing

- **ARASAAC** symbols are free under CC BY-NC-SA — fine for personal/non-commercial use like this, just credit ARASAAC + Gobierno de Aragón somewhere in an "about" screen.
- If you want an alternative or supplementary set, **Mulberry Symbols** and **SCLERA** are also free/open options with slightly different visual styles.
