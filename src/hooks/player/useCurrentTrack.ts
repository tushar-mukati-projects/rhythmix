import { useMemo } from 'react';
import { useActiveTrack } from 'react-native-track-player';
import { artFor } from '@/lib/art';
import { useAppStore } from '@/stores/app-store';
import { Track } from '@/types';

export const useCurrentTrack = (): Track | null => {
  const library = useAppStore((s) => s.library);
  const externalTrack = useAppStore((s) => s.externalTrack);
  const activeTrack = useActiveTrack();
  const currentId = (activeTrack as { id?: string } | undefined)?.id ?? null;

  return useMemo(() => {
    if (!currentId || !activeTrack) return null;
    if (externalTrack && externalTrack.id === currentId) return externalTrack;
    const fromLibrary = library.find((t) => t.id === currentId);
    if (fromLibrary) return fromLibrary;
    // Active track no longer in the library (e.g. removed by a rescan) —
    // keep the player UI alive with the queue's own metadata.
    const title = activeTrack.title ?? 'Unknown title';
    const artist = activeTrack.artist ?? 'Unknown artist';
    const album = activeTrack.album ?? 'Unknown album';
    return {
      id: currentId,
      uri: String(activeTrack.url ?? ''),
      title,
      artist,
      album,
      duration: activeTrack.duration ?? 0,
      art: artFor(`${album}|${artist}`),
    };
  }, [library, externalTrack, currentId, activeTrack]);
};
