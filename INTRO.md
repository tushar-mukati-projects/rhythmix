# Rhythmix — Project Walkthrough

A 5-minute tour of what this app is, how it's built, and how it works — explained the way
you'd explain it in an interview.

## What is it?

Rhythmix is an **offline music player for Android**, built from a high-fidelity design
handoff. It scans the music files already on your phone, plays them with full background
support (Spotify-style notification with artwork and controls), and persists everything —
your library, liked songs, and even the exact position of the last song you played.

## Tech stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Framework | **React Native via Expo (SDK 56)** | One TypeScript codebase, native performance, Expo's prebuild manages the native projects |
| Language | **TypeScript (strict)** | Compile-time safety; every API response and prop is typed |
| Audio engine | **react-native-track-player** | The only RN library with a real native playback service: background audio, media notification, lock-screen controls, queue management |
| Local file scan | **expo-media-library** | Queries Android's MediaStore index of on-device audio |
| Tag reading | **@missingcore/audio-metadata** | Pure-JS ID3/FLAC parser — extracts title/artist/album + embedded cover art |
| State | **zustand** | Tiny store for UI/app state; the player itself is the source of truth for playback state |
| Persistence | **AsyncStorage** | Library index, liked map, and playback session as JSON |
| Animations | **react-native-reanimated** | UI-thread animations: spinning vinyl, equalizer bars, slide-up player |
| Graphics | **react-native-svg** | Hand-drawn icons, the vinyl disc, gradient placeholder artwork |

## How it works, step by step

1. **Launch** — the store hydrates from AsyncStorage. If a library exists → straight to
   Library; otherwise → Onboarding. In parallel, the audio engine initializes and the
   last session (track + position) is restored, paused.
2. **Scan** — with the `READ_MEDIA_AUDIO` permission granted, we page through MediaStore
   (64 assets per page) and read each file's tags **8 files concurrently**. Embedded cover
   art is written to the cache directory; files without tags fall back to filename-derived
   titles and a deterministic gradient (hash of `album|artist` picks 1 of 12 palettes).
3. **Library → playback** — tapping a song builds the player **queue** (the whole library,
   so next/prev and auto-advance work natively, even from the notification) and skips to
   that track. A "signature" of sorted track ids prevents needless queue rebuilds.
4. **Background playback** — the playback service is a separate headless JS task that
   keeps running when the app is closed (`ContinuePlayback`). It handles notification
   button events and saves the session every 5 seconds.
5. **Smart auto-advance** — instead of letting the engine gaplessly jump to the next song,
   we *predict* the track's end from progress events and pause 0.25s before it. The
   finished song holds on screen for 2 seconds, then the next starts. Any manual action
   cancels the hold instantly.
6. **Shuffle** — reorders the *live* queue (current track stays playing) so the
   notification's next button and auto-advance follow shuffle order too.
7. **Open-with** — an Android intent filter (`ACTION_VIEW`, `audio/*`) lets file managers
   open audio in Rhythmix; library files play in context, foreign files play as a one-off.

## Code organization

```
src/
  types/        shared interfaces (Track, GradientArt, …)
  lib/          pure logic: theme tokens, scanner, formatters
  lib/player/   the audio engine wrapper: setup, controls, background service
  stores/       zustand app store (+ AsyncStorage persistence)
  hooks/        one hook per file, grouped by domain (player/, library/)
  components/ui reusable primitives (icons, buttons)
  features/     domain components (MiniPlayer, VinylArtwork, TrackRow, …)
  screens/      Onboarding, Scanning, Library, Search, NowPlaying
```

Conventions: arrow functions only, named exports, `@/` path alias, `interface` for data
shapes / `type` for unions, near-zero comments — names carry the meaning.

## Hard problems we solved (good interview stories)

- **Library predates the new RN architecture** — track-player 4.1.2 wouldn't compile/run
  on RN 0.85, so we patched it (Kotlin nullability, TurboModule method signatures, the
  bridgeless event emitter) and pinned the patches with `patch-package`.
- **Android clipping bug** — `overflow: hidden` silently fails inside rotated views, so
  the spinning vinyl's circular artwork label is clipped with an SVG `ClipPath` instead.
- **Android elevation beats zIndex** — the full-screen player overlay needed its own
  `elevation`, or elevated buttons punched through it.
- **MediaStore pending rows** — files pushed to the device can sit `is_pending=1` and stay
  invisible to apps until a proper volume scan runs.

## Development & running

- **Two build flavors**: a *debug* build loads JS live from the Metro dev server (hot
  reload, used for iteration) and a *release* build bundles JS into the APK (standalone,
  what's installed for daily use).
- Native modules mean **Expo Go can't run this** — we use a dev build via
  `npx expo run:android` (emulator or USB device with debugging enabled).
- Release: `cd android && .\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a`
  → a ~34 MB APK installed with `adb install`.
- Quality gates: strict `tsc --noEmit`, multi-agent code review, and on-device
  verification (screenshots, media-session state, notification behavior) for every change.

## One-liner answers

- *"How does background playback work?"* — A native Android foreground service owned by
  track-player keeps the audio session alive; a registered headless JS task handles the
  notification's play/pause/next events even when the UI is dead.
- *"Where does state live?"* — Playback state lives in the native player (queried via
  hooks); app/UI state lives in zustand; both stay in sync through events, not duplication.
- *"Why Expo if you need native modules?"* — Expo prebuild generates the native projects
  from config, so we get native capability *and* managed-workflow ergonomics.
