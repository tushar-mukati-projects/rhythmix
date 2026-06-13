import { useCallback, useEffect, useState } from 'react';
import TrackPlayer, {
  Event,
  useActiveTrack,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { useAppStore } from '@/stores/app-store';
import { Track } from '@/types';

export const useNextUp = (): Track | null => {
  const library = useAppStore((s) => s.library);
  const shuffle = useAppStore((s) => s.shuffle);
  const queueVersion = useAppStore((s) => s.queueVersion);
  const activeTrack = useActiveTrack();
  const [nextUp, setNextUp] = useState<Track | null>(null);

  const currentId = (activeTrack as { id?: string } | undefined)?.id ?? null;

  const refreshNextUp = useCallback(async () => {
    const [queue, index] = await Promise.all([
      TrackPlayer.getQueue(),
      TrackPlayer.getActiveTrackIndex(),
    ]);
    if (index == null || queue.length === 0) {
      setNextUp(null);
      return;
    }
    const next = queue[(index + 1) % queue.length] as { id?: string };
    setNextUp(library.find((t) => t.id === next.id) ?? null);
  }, [library]);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], () => {
    refreshNextUp().catch(() => {});
  });
  useEffect(() => {
    if (currentId) refreshNextUp().catch(() => {});
  }, [currentId, shuffle, queueVersion, refreshNextUp]);

  return nextUp;
};
