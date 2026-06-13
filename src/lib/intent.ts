import { artFor } from '@/lib/art';
import { playExternalTrack, playTrack } from '@/lib/player/controls';
import { useAppStore } from '@/stores/app-store';
import { Track } from '@/types';

const AUDIO_SCHEMES = ['content://', 'file://'];

export const openAudioUrl = async (url: string): Promise<void> => {
  if (!AUDIO_SCHEMES.some((s) => url.startsWith(s))) return;

  const { library, setExternalTrack, setScreen, setNpOpen } = useAppStore.getState();

  const mediaId = url.match(/\/audio\/media\/(\d+)$/)?.[1];
  const libraryMatch =
    library.find((t) => t.uri === url) ??
    (mediaId ? library.find((t) => t.id === mediaId) : undefined);

  if (libraryMatch) {
    setScreen('home');
    setNpOpen(true);
    await playTrack(library, libraryMatch.id, useAppStore.getState().shuffle);
    return;
  }

  const fileName = decodeURIComponent(url.split('/').pop() ?? '');
  const title = fileName.replace(/\.[^.]+$/, '') || 'Unknown title';
  const track: Track = {
    id: `external:${url}`,
    uri: url,
    title,
    artist: 'Unknown artist',
    album: 'External file',
    duration: 0,
    art: artFor(title),
  };

  setExternalTrack(track);
  setScreen('home');
  setNpOpen(true);
  await playExternalTrack(track);
};
