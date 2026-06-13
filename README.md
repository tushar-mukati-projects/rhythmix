# Rhythmix

A local music player built with Expo + React Native from the design handoff in `ref/`.
Warm cream surfaces, sunset gradient artwork, one blue accent — onboarding, real library
scan, search, mini-player, and a full Now Playing screen with background playback.

## Features

- **Real local scan** — indexes on-device audio via MediaStore (`expo-media-library`),
  reads ID3/FLAC tags + embedded album art (`@missingcore/audio-metadata`), with a
  filename fallback and warm gradient + initial-letter placeholder art.
- **Real playback with media notification** — `react-native-track-player` drives audio,
  so the song keeps playing when the app is backgrounded or closed, with
  Spotify-style controls in the notification panel / lock screen
  (`AppKilledPlaybackBehavior.ContinuePlayback`).
- **Library / Search / Mini-player / Now Playing** per the design: animated equalizer on
  the current row, slide-up Now Playing overlay, pause-shrink artwork, drag-to-seek
  scrubber, shuffle (reorders the live queue so notification next/prev follow it),
  repeat-one, liked tracks and the library index persisted across launches.
- **Music-note fallback artwork** — tracks without embedded art get a music-note
  placeholder in the list and in the media notification.
- **Pull-to-refresh rescan** — drag down on the library to re-index the device.
- **Parallel metadata scanning** — tags/artwork are extracted concurrently for a
  much faster first scan.
- **Session restore** — the last track and position are restored (paused) on launch.
- **2-second breather between tracks** — when a song finishes naturally it holds at
  its end for 2 seconds before the next one starts; manual skips and song taps are
  instant and cancel the hold.
- **Custom vinyl app icon + splash** — adaptive launcher icon (with monochrome
  variant) and a matching splash screen.

## Run it

This app uses native modules (track-player), so it needs a dev build — **not Expo Go**:

```sh
npm install
npx expo run:android        # device or emulator with audio files on it
```

iOS note: `expo-media-library` exposes the photo library on iOS, which does not contain
music files; the local-scan flow is Android-first. iOS would need an `MPMediaQuery`
native module to enumerate the music library.

## Structure

Imports use the `@/` path alias (maps to `src/`).

```
src/
  types/index.ts        Track / GradientArt / screen types
  lib/
    theme.ts            design tokens (colors, fonts, shadows)
    art.ts              sunset gradient palettes + deterministic pick
    format.ts           m:ss formatting
    scanner.ts          MediaStore scan + tag/artwork extraction
    player/
      setup.ts          track-player init (capabilities, notification)
      controls.ts       queue sync, play/next/prev/seek/shuffle/repeat
      service.ts        background service (remote/notification events)
  stores/app-store.ts   zustand app state + AsyncStorage persistence
  hooks/
    player/             useCurrentTrack, useIsPlaying, useNextUp,
                        useSessionRestore
    library/            useRecents, useSearchResults
  components/ui/        icons, ScaleButton, CircleButton
  features/
    player/             Artwork, Equalizer, MiniPlayer
    library/            TrackRow
    onboarding/         SunsetGlow, VinylDisc
  screens/              Onboarding, Scanning, Library, Search, NowPlaying
```

`ref/` holds the original HTML design prototype (not part of the app).

`patches/` contains a `patch-package` patch for `react-native-track-player`
(new-architecture fixes), applied automatically via the `postinstall` script —
do not delete it.

## Release build

```powershell
cd android
.\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

This produces a standalone APK (JS bundle embedded — no Metro needed) at
`android/app/build/outputs/apk/release/app-release.apk`.

Note: the release build is signed with the **debug keystore** by default, which
is fine for installing on your own devices, but Play Store distribution requires
generating and configuring a proper release keystore.
