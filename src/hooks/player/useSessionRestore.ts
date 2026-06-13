import { useEffect, useRef } from 'react';
import { restoreSession } from '@/lib/player/controls';
import { useAppStore } from '@/stores/app-store';

export const useSessionRestore = () => {
  const hydrated = useAppStore((s) => s.hydrated);
  const hasLibrary = useAppStore((s) => s.library.length > 0);
  const restored = useRef(false);

  useEffect(() => {
    if (!hydrated || !hasLibrary || restored.current) return;
    restored.current = true;
    restoreSession(useAppStore.getState().library).catch(() => {});
  }, [hydrated, hasLibrary]);
};
