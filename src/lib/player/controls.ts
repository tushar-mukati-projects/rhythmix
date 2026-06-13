import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, {
  RepeatMode,
  State,
  Track as PlayerTrack,
} from 'react-native-track-player';
import { fallbackArtFor } from '@/lib/fallback-art';
import { setupPlayer } from '@/lib/player/setup';
import { useAppStore } from '@/stores/app-store';
import { Track } from '@/types';

const SESSION_KEY = 'rhythmix.session';
const SESSION_SAVE_INTERVAL = 5000;
const AUTO_ADVANCE_DELAY = 2000;
const END_GUARD = 0.25;

interface PlaybackSession {
  trackId: string;
  position: number;
}

let queueSignature = '';
let lastSessionSave = 0;
let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
let endWatchTimer: ReturnType<typeof setTimeout> | null = null;
// Bumped by every manual control; lets in-flight end-watch callbacks detect
// that the user acted while they were awaiting native calls.
let generation = 0;

// Every queue mutation is a multi-step async sequence over shared native
// state; serializing them prevents interleaved reset/add/remove corruption.
let lock: Promise<unknown> = Promise.resolve();
const serialized = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = lock.then(fn, fn);
  lock = run.catch(() => {});
  return run;
};

export const cancelAutoAdvanceDelay = (): void => {
  generation++;
  if (endWatchTimer != null) {
    clearTimeout(endWatchTimer);
    endWatchTimer = null;
  }
  if (autoAdvanceTimer != null) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
};

/**
 * Pauses just before the track's natural end so the finished song stays on
 * screen with its progress bar at the end, then starts the next track after
 * AUTO_ADVANCE_DELAY. Any manual control cancels via cancelAutoAdvanceDelay.
 */
export const armEndWatch = (remaining: number, trackIndex?: number): void => {
  if (autoAdvanceTimer != null) return;
  if (endWatchTimer != null) clearTimeout(endWatchTimer);
  endWatchTimer = setTimeout(
    () => onTrackEnding(trackIndex),
    Math.max(0, (remaining - END_GUARD) * 1000),
  );
};

const onTrackEnding = async (armedIndex?: number): Promise<void> => {
  endWatchTimer = null;
  const gen = generation;
  const repeatMode = await TrackPlayer.getRepeatMode();
  if (repeatMode === RepeatMode.Track) return;
  const [{ position, duration }, { state }, activeIndex] = await Promise.all([
    TrackPlayer.getProgress(),
    TrackPlayer.getPlaybackState(),
    TrackPlayer.getActiveTrackIndex(),
  ]);
  if (gen !== generation) return;
  if (armedIndex != null && activeIndex !== armedIndex) return;
  if (state !== State.Playing || duration <= 0 || duration - position > 1) return;
  await TrackPlayer.pause();
  if (gen !== generation) return;
  const indexAfterPause = await TrackPlayer.getActiveTrackIndex();
  if (indexAfterPause !== activeIndex) {
    // Native advanced before our pause landed — undo and let it play.
    await TrackPlayer.play();
    return;
  }
  autoAdvanceTimer = setTimeout(() => {
    autoAdvanceTimer = null;
    serialized(async () => {
      const queue = await TrackPlayer.getQueue();
      if (queue.length > 1) await nextInner();
    }).catch(() => {});
  }, AUTO_ADVANCE_DELAY);
};

const toPlayerTrack = (track: Track): PlayerTrack => ({
  id: track.id,
  url: track.uri,
  title: track.title,
  artist: track.artist,
  album: track.album,
  duration: track.duration,
  artwork: track.artworkUri ?? fallbackArtFor(track.art),
});

const trackId = (track: PlayerTrack): string =>
  (track as { id?: string }).id ?? '';

const syncQueueInner = async (library: Track[]): Promise<void> => {
  await setupPlayer();
  const signature = library
    .map((t) => t.id)
    .sort()
    .join(',');
  if (signature === queueSignature) return;
  await TrackPlayer.reset();
  await TrackPlayer.add(library.map(toPlayerTrack));
  queueSignature = signature;
};

const nextInner = async (): Promise<void> => {
  try {
    await TrackPlayer.skipToNext(0);
  } catch {
    await TrackPlayer.skip(0, 0);
  }
  await TrackPlayer.play();
};

const applyShuffleInner = async (on: boolean, library: Track[]): Promise<void> => {
  await setupPlayer();
  const inGap = autoAdvanceTimer != null;
  cancelAutoAdvanceDelay();
  const queue = await TrackPlayer.getQueue();
  const current = await TrackPlayer.getActiveTrackIndex();
  if (queue.length < 2 || current == null) return;

  const currentId = trackId(queue[current]);
  try {
    const others = queue.map((_, i) => i).filter((i) => i !== current);
    await TrackPlayer.remove(others);

    if (on) {
      const rest = library.filter((t) => t.id !== currentId);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      await TrackPlayer.add(rest.map(toPlayerTrack));
    } else {
      const libIndex = library.findIndex((t) => t.id === currentId);
      const before = library.slice(0, Math.max(0, libIndex));
      const after = library.slice(libIndex + 1);
      if (before.length) await TrackPlayer.add(before.map(toPlayerTrack), 0);
      if (after.length) await TrackPlayer.add(after.map(toPlayerTrack));
    }
  } catch (error) {
    queueSignature = '';
    throw error;
  } finally {
    useAppStore.getState().bumpQueueVersion();
  }
  if (inGap) await nextInner();
};

export const playTrack = (
  library: Track[],
  id: string,
  shuffle: boolean,
): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    await syncQueueInner(library);
    const queue = await TrackPlayer.getQueue();
    const index = queue.findIndex((t) => trackId(t) === id);
    if (index < 0) return;
    await TrackPlayer.skip(index, 0);
    await TrackPlayer.play();
    if (shuffle) await applyShuffleInner(true, library);
  });

/** Plays a one-off file opened from outside the app (file manager "Open with"). */
export const playExternalTrack = (track: Track): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    await setupPlayer();
    await TrackPlayer.reset();
    await TrackPlayer.add([toPlayerTrack(track)]);
    queueSignature = `external:${track.id}`;
    await TrackPlayer.play();
  });

/**
 * Reorders the upcoming queue in place (current track keeps playing), so the
 * notification's next/prev and gapless auto-advance follow shuffle order too.
 */
export const applyShuffle = (on: boolean, library: Track[]): Promise<void> =>
  serialized(() => applyShuffleInner(on, library));

export const togglePlayback = (): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    const { state } = await TrackPlayer.getPlaybackState();
    if (state === State.Playing) await TrackPlayer.pause();
    else await TrackPlayer.play();
  });

export const resumePlayback = (): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    await TrackPlayer.play();
  });

export const pausePlayback = (): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    await TrackPlayer.pause();
  });

export const stopPlayback = (): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    await TrackPlayer.stop();
  });

export const nextTrack = (): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    await nextInner();
  });

export const prevTrack = (): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    const { position } = await TrackPlayer.getProgress();
    if (position > 4) {
      await TrackPlayer.seekTo(0);
      return;
    }
    try {
      await TrackPlayer.skipToPrevious(0);
    } catch {
      const queue = await TrackPlayer.getQueue();
      await TrackPlayer.skip(Math.max(0, queue.length - 1), 0);
    }
    await TrackPlayer.play();
  });

export const seekTo = (position: number): Promise<void> =>
  serialized(async () => {
    cancelAutoAdvanceDelay();
    await TrackPlayer.seekTo(position);
  });

export const setRepeat = async (on: boolean): Promise<void> => {
  if (on) cancelAutoAdvanceDelay();
  await TrackPlayer.setRepeatMode(on ? RepeatMode.Track : RepeatMode.Queue);
};

export const saveSession = async (position: number): Promise<void> => {
  const now = Date.now();
  if (now - lastSessionSave < SESSION_SAVE_INTERVAL) return;
  lastSessionSave = now;
  const track = await TrackPlayer.getActiveTrack();
  const id = track ? trackId(track) : '';
  if (!id) return;
  const session: PlaybackSession = { trackId: id, position };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session)).catch(() => {});
};

export const restoreSession = (library: Track[]): Promise<void> =>
  serialized(async () => {
    if (library.length === 0) return;
    try {
      await setupPlayer();
      const [{ state }, activeTrack] = await Promise.all([
        TrackPlayer.getPlaybackState(),
        TrackPlayer.getActiveTrack(),
      ]);
      // The user (or a surviving background session) is already on a track.
      if (activeTrack != null || state === State.Playing || state === State.Buffering) {
        return;
      }
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const session: PlaybackSession = JSON.parse(raw);
      const track = library.find((t) => t.id === session.trackId);
      if (!track) return;
      await syncQueueInner(library);
      const queue = await TrackPlayer.getQueue();
      const index = queue.findIndex((t) => trackId(t) === session.trackId);
      if (index < 0) return;
      const maxPosition = track.duration > 1 ? track.duration - 1 : 0;
      const position = Math.min(Math.max(0, Number(session.position) || 0), maxPosition);
      await TrackPlayer.skip(index, position);
    } catch {
      // Corrupt session — start fresh.
    }
  });
