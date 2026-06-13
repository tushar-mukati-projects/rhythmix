# Handoff: Rhythmix — Local Music Player (Mobile)

## Overview
Rhythmix is a mobile app that plays music files stored locally on the user's device. This handoff covers the full first-run and core playback experience: **Onboarding → Library Scan → Library → Search → Mini-player → Now Playing**. The design is warm and friendly — cream surfaces, sunset-toned album art, and a single blue accent.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing the intended look and behavior. They are **not production code to copy directly**.

Your task is to **recreate these designs in the target codebase's existing environment** (React Native, Flutter, SwiftUI, Kotlin/Compose, etc.) using its established patterns and libraries. If no codebase exists yet, choose the most appropriate mobile framework and implement the designs there. Real implementations should replace the prototype's simulated behaviors (fake scan, timer-driven playback) with actual local-file scanning (e.g. MediaStore on Android, MediaPlayer/AVFoundation on iOS) and real audio playback.

- `Rhythmix.dc.html` — the full prototype (open in a browser to click through it). The template markup is inside `<x-dc>…</x-dc>`; the behavior is in the `Component` class in the same file.
- `support.js`, `ios-frame.jsx` — prototype runtime + iPhone bezel scaffold. **Ignore these for implementation**; they exist only so the HTML file runs standalone.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows, copy, and interactions are final intent. Recreate pixel-perfectly with your codebase's component library. One exception: **album artwork uses gradient placeholders** — production should render real embedded album art from the files' metadata, falling back to a warm gradient + large initial letter (as in the Now Playing screen) when art is missing.

## Design Tokens

### Colors
| Token | Value | Use |
|---|---|---|
| `cream-bg` | `#FAF4E8` | App background |
| `card` | `#FFFCF5` | Buttons, search field, cards |
| `card-elevated` | `#FFFDF6` | Mini-player |
| `ink` | `#2B2118` | Primary text, icons |
| `muted` | `#8C7A63` | Secondary text |
| `faint` | `#B3A48C` | Tertiary text, placeholders, durations |
| `label` | `#A99A82` | Section labels (uppercase), inactive control icons |
| `accent` | `#2E7FC1` | Primary actions, play button, progress fills, active states |
| `accent-on` | `#FDFAF2` | Text/icons on accent |
| `heart` | `#E2674A` | Liked state (heart fill + stroke) |
| `hairline` | `rgba(43,33,24,0.05–0.12)` | Borders, track backgrounds |

Sunset gradient pairs used for placeholder art (135–160deg linear): `#F6B26B→#E2674A`, `#E98F6F→#B14E5E`, `#F4CE6A→#E08A4E`, `#7B9DC9→#46618F`, `#F2A9A2→#C96A8B`, `#E8B27D→#A65B43`, `#C98A5E→#7E4A38`, `#A86FA0→#5F4B8B`, `#EE9E5F→#C24E55`, `#D96E5B→#8E3B58`, `#F3C57E→#D2694F`, `#F0D9A6→#D49A57`. Each is overlaid with `radial-gradient(circle at 30% 22%, rgba(255,255,255,0.32), transparent 58%)` for a soft top-left sheen.

### Typography
- **Display**: Bricolage Grotesque (Google Fonts) — weights 700/800, tight letter-spacing (−0.5 to −1.5px). Used for: app wordmark, screen titles, song title in Now Playing, empty states.
- **Body**: Hanken Grotesk (Google Fonts) — weights 400–800. Everything else.

Scale: 46px onboarding wordmark · 34px Library title · 25px Now Playing title · 22–23px wordmark/scanning header · 15.5–17px list titles & buttons · 13–14px secondary · 11–12px uppercase labels (letter-spacing 1.2–1.6px, weight 800).

### Spacing & shape
- Screen horizontal padding: 22px (library/search), 26px (Now Playing).
- Radii: 999px pills/circles · 26px Now Playing art · 20px mini-player & recents art · 16px action buttons · 14px list art (50px tile) · 13px mini art (46px) · 11px up-next art (38px).
- Shadows are warm-tinted: e.g. `0 16px 36px rgba(73,49,24,0.24)` (mini-player), `0 12px 26px rgba(46,127,193,0.38)` (accent buttons), `0 34px 70px {artGlow}66` (Now Playing art). Hairline ring: `0 0 0 1px rgba(43,33,24,0.05)`.
- Minimum hit target: 40×40px (most controls 40–74px).

## Screens / Views

### 1. Onboarding
- **Purpose**: First launch; explains the app and asks permission to scan local storage.
- **Layout**: Vertically centered column, centered text, 36px side padding. Background: cream with a faint sunset radial glow at top (`rgba(242,166,90,0.25)` fading by 55%).
- **Components**:
  - Vinyl logo disc, 122px circle: dark disc `#2F2419`, sunset label rings (`#E2674A` inner, `#F2A65A` outer), cream center hole, faint groove rings and a rotating-style light wedge. Shadow `0 20px 44px rgba(73,49,24,0.3)`.
  - Wordmark "Rhythmix" — Bricolage 46/800, −1.5px.
  - Tagline: "All the music on this phone, beautifully played." 16.5px, muted, max-width 250px.
  - Primary button "Scan my music" with search icon — accent pill, 17px/700, padding 16×32, accent shadow. Pressed: scale 0.95.
  - Footnote: "MP3 · FLAC · WAV — nothing ever leaves your phone" 13px faint.

### 2. Scanning
- **Purpose**: Progress feedback while indexing local audio.
- **Components** (centered column):
  - Same vinyl disc at 128px, **spinning** (2.6s linear infinite).
  - "Scanning your music…" Bricolage 23/700.
  - Status line cycling through folders: "Looking in Music/", "Downloads/", "WhatsApp Audio/", "Recordings/" (14.5px muted).
  - Progress bar 230×6px, track `rgba(43,33,24,0.1)`, fill gradient `#F2A65A → #2E7FC1`, rounded.
  - Counter "N SONGS FOUND" — 13px/700 accent, letter-spacing 1.2px.
- **Behavior**: In the prototype this is a ~3s simulation, then auto-navigates to Library. In production: real scan with live count, navigate when complete.

### 3. Library (home)
- **Layout**: Fixed header block; scrollable content below; floating mini-player.
- **Header** (68px top padding to clear status bar):
  - Row: wordmark "Rhythmix" (Bricolage 22/800) + 9px sunset gradient dot · right: 40px circular search button (card bg, ink icon).
  - Title "Library" — Bricolage 34/800.
  - Subtitle "12 songs · stored on this phone" — 14px muted (count is dynamic).
  - Action row: two equal buttons, 48px tall, radius 16: **Play** (accent, filled, play icon) and **Shuffle** (card bg, ink, shuffle icon). Pressed: scale 0.96.
  - Header fades into content via a cream→transparent gradient.
- **RECENTLY ADDED** — uppercase 12/800 label (`#A99A82`, ls 1.4px); horizontal scroller of 128px cards: square art (radius 20) + album name 14/700 + artist 12.5 muted, single-line ellipsis. Tap = play that album's track.
- **ALL SONGS** — list rows: 50px art (radius 14) · title 15.5/700 ink + "Artist · Album" 13px muted (both ellipsized) · right side shows duration `m:ss` (13/600 faint) OR, for the currently-playing track, a 3-bar animated equalizer (3.5px bars, accent, staggered scaleY animation ~0.75–1.05s; paused when playback paused). Current track's title turns accent. Row hover/press: `rgba(43,33,24,0.035 / 0.06)` background. Tap = play from start.
- Content bottom padding 130px so the mini-player never covers the last row.

### 4. Search
- **Layout**: Same header position. Row: 40px circular back button + pill search field (46px, card bg, search icon, placeholder "Songs, artists, albums…", 16px/500). Field is auto-focused on entry.
- **Behavior**: Live case-insensitive filtering across title + artist + album. Results use the identical row component as ALL SONGS (including the equalizer state). Back button clears the query and returns to Library.
- **Empty state**: centered — "No matches for “query”" (Bricolage 19/700) + "Try a different song, artist or album name." (14px muted).

### 5. Mini-player (floating)
- Appears once any track has been selected; persists across Library/Search.
- 14px from screen edges, 28px from bottom; card-elevated bg, radius 20, big warm shadow + hairline ring; padding 10–12px.
- Contents: 46px art · title 15/700 + artist 13 muted (ellipsized) · play/pause icon button · next icon button.
- Progress hairline: 3px rounded bar pinned to the card's bottom edge (inset 14px), track `rgba(43,33,24,0.07)`, accent fill = elapsed %.
- Tap anywhere (except the two buttons — they stop propagation) opens Now Playing.

### 6. Now Playing (full-screen overlay)
- **Entry/exit**: slides up from the bottom over the Library, 0.55s `cubic-bezier(0.32, 0.72, 0.16, 1)`; chevron-down button closes it. Status bar stays visible.
- **Background**: opaque cream with a tint of the current track's glow color at top: `linear-gradient(180deg, {glow}55 0%, transparent 52%)` over `#FAF4E8`. (Production: derive glow from album art's dominant color.)
- **Header row**: 38px circle close button (chevron-down) · centered "PLAYING FROM" (11/800, ls 1.6, label color) over "Local Library" (14/700 ink) · invisible 38px spacer for balance.
- **Artwork**: 308×308px, radius 26, centered in flexible space. Shadow: `0 34px 70px {glow}66, 0 8px 24px rgba(73,49,24,0.2)`. A giant translucent first letter of the title (Bricolage 230/800, `rgba(255,252,245,0.22)`) bleeds off the bottom-right corner. **Scales to 0.9 when paused, 1.0 when playing** (0.45s springy ease `cubic-bezier(0.34, 1.4, 0.5, 1)`).
- **Title block**: song title Bricolage 25/800 + "Artist · Album" 16px muted (ellipsized); right: 42px circle heart button — outline ink by default; liked = filled + stroked `#E2674A`.
- **Scrubber**: 6px rounded track `rgba(43,33,24,0.12)`, accent fill, 15px cream thumb with shadow at the playhead. Tap/drag to seek. Below: elapsed `m:ss` left, remaining `-m:ss` right (12.5/600 muted).
- **Transport row** (5-column grid, centered): shuffle toggle · previous · **74px accent play/pause circle** (white icon, accent glow shadow, pressed scale 0.92) · next · repeat toggle. Toggles: `#A99A82` inactive → accent when active. Icon buttons pressed: scale 0.85.
- **Up Next card**: card bg at 75% opacity, radius 18, padding 11×14: 38px next-track art · "UP NEXT" label + "Title · Artist" 14px · chevron-right. Tap = skip to next.

## Interactions & Behavior
- **Playback simulation** (replace with real audio): 500ms tick advances elapsed time while playing; at track end → auto-advance to next (or restart if repeat is on).
- **Next/Previous**: next wraps around the list; previous restarts the current track if elapsed > 4s, otherwise goes to the prior track. Shuffle on → next picks a random different track.
- **Play (header)** starts the first song; **Shuffle (header)** enables shuffle and starts a random song.
- **State after track selection**: `playing = true`, elapsed resets to 0.
- All buttons have pressed-state scale feedback (0.85–0.96, ~0.15s ease). List rows have hover/press background tints.

## State Management
- `screen`: `onboarding | scanning | home`
- `view`: `library | search`; `query`: string
- `currentId`: selected track id or null (null = no mini-player, no Now Playing)
- `playing`: bool; `elapsed`: seconds; `npOpen`: bool (Now Playing overlay)
- `liked`: map of track id → bool; `shuffle`, `repeat`: bools
- Scan: `scanPct`, `scanCount`
- Data per track: `id, title, artist, album, duration, artwork, glowColor`
- Production additions: persisted library index, last-played track + position, liked set (persist across launches).

## Assets
- **Fonts**: Bricolage Grotesque + Hanken Grotesk, both on Google Fonts (self-host or platform-bundle for production).
- **Icons**: simple 2.2–2.4px-stroke line icons (search, chevrons, heart, shuffle, repeat) and filled glyphs (play, pause, prev/next). Inline SVGs in the prototype; substitute your icon library's equivalents at the same optical sizes.
- **Album art**: gradient placeholders only — use real embedded artwork in production, with the gradient + initial-letter fallback.
- No raster assets are required.

## Files
- `Rhythmix.dc.html` — full interactive prototype (all screens, all behavior). Open in a browser.
- `ios-frame.jsx` — iPhone bezel used purely for presentation.
- `support.js` — prototype runtime. Not part of the design.
