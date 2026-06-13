import TrackPlayer, { Event } from 'react-native-track-player';
import {
  armEndWatch,
  nextTrack,
  pausePlayback,
  prevTrack,
  resumePlayback,
  saveSession,
  seekTo,
  stopPlayback,
} from '@/lib/player/controls';

let registered = false;

export const playbackService = async (): Promise<void> => {
  if (registered) return;
  registered = true;

  TrackPlayer.addEventListener(Event.RemotePlay, () => resumePlayback());
  TrackPlayer.addEventListener(Event.RemotePause, () => pausePlayback());
  TrackPlayer.addEventListener(Event.RemoteNext, () => nextTrack());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => prevTrack());
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => seekTo(e.position));
  TrackPlayer.addEventListener(Event.RemoteStop, () => stopPlayback());
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (e) => {
    saveSession(e.position);
    const remaining = e.duration - e.position;
    if (e.duration > 0 && remaining <= 1.3) armEndWatch(remaining, e.track);
  });
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (e) => {
    // Short tracks can finish before the first progress event fires.
    const duration = e.track?.duration;
    if (typeof duration === 'number' && duration > 0 && duration <= 3) {
      armEndWatch(duration, e.index);
    }
  });
  TrackPlayer.addEventListener(Event.PlaybackError, async () => {
    // Unplayable file (deleted on disk, dead URI) — move on.
    const queue = await TrackPlayer.getQueue();
    if (queue.length > 1) nextTrack();
  });
};
