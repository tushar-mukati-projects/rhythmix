import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Track } from '@/types';

export const useSearchResults = (): Track[] => {
  const library = useAppStore((s) => s.library);
  const query = useAppStore((s) => s.query);
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return library;
    return library.filter((t) =>
      `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(q),
    );
  }, [library, query]);
};
