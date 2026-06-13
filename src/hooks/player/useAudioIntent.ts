import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { openAudioUrl } from '@/lib/intent';
import { useAppStore } from '@/stores/app-store';

export const useAudioIntent = () => {
  const hydrated = useAppStore((s) => s.hydrated);
  const handledInitial = useRef(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!handledInitial.current) {
      handledInitial.current = true;
      Linking.getInitialURL()
        .then((url) => {
          if (url) openAudioUrl(url).catch(() => {});
        })
        .catch(() => {});
    }

    const sub = Linking.addEventListener('url', (e) => {
      openAudioUrl(e.url).catch(() => {});
    });
    return () => sub.remove();
  }, [hydrated]);
};
