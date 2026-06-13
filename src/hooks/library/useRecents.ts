import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Track } from '@/types';

export const useRecents = (): Track[] => {
  const library = useAppStore((s) => s.library);
  return useMemo(() => {
    const seen = new Set<string>();
    const recents: Track[] = [];
    for (const track of library) {
      const key = `${track.album}|${track.artist}`;
      if (!seen.has(key)) {
        seen.add(key);
        recents.push(track);
      }
      if (recents.length === 8) break;
    }
    return recents;
  }, [library]);
};
