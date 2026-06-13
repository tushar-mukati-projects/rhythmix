import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { create } from 'zustand';
import { artFor } from '@/lib/art';
import { LibraryView, ScanProgress, Screen, Track } from '@/types';

const LIBRARY_KEY = 'rhythmix.library';
const LIKED_KEY = 'rhythmix.liked';

interface AppState {
  screen: Screen;
  view: LibraryView;
  query: string;
  library: Track[];
  liked: Record<string, boolean>;
  shuffle: boolean;
  repeat: boolean;
  npOpen: boolean;
  scan: ScanProgress;
  hydrated: boolean;
  externalTrack: Track | null;
  queueVersion: number;

  setScreen: (screen: Screen) => void;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
  setLibrary: (library: Track[]) => void;
  toggleLike: (id: string) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: boolean) => void;
  setNpOpen: (open: boolean) => void;
  setScan: (scan: ScanProgress) => void;
  setExternalTrack: (track: Track | null) => void;
  bumpQueueVersion: () => void;
  hydrate: () => Promise<void>;
}

const persistLiked = (liked: Record<string, boolean>) =>
  AsyncStorage.setItem(LIKED_KEY, JSON.stringify(liked)).catch(() => {});

/** Drops artworkUri values whose cache files the OS has evicted. */
const pruneDeadArtwork = async (library: Track[]): Promise<Track[] | null> => {
  const checks = await Promise.all(
    library.map(async (t) => {
      if (!t.artworkUri) return t;
      try {
        const info = await FileSystem.getInfoAsync(t.artworkUri);
        return info.exists ? t : { ...t, artworkUri: undefined };
      } catch {
        return { ...t, artworkUri: undefined };
      }
    }),
  );
  const changed = checks.some((t, i) => t !== library[i]);
  return changed ? checks : null;
};

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'onboarding',
  view: 'library',
  query: '',
  library: [],
  liked: {},
  shuffle: false,
  repeat: false,
  npOpen: false,
  scan: { pct: 0, count: 0, folder: 'Music/' },
  hydrated: false,
  externalTrack: null,
  queueVersion: 0,

  setScreen: (screen) => set({ screen }),
  openSearch: () => set({ view: 'search' }),
  closeSearch: () => set({ view: 'library', query: '' }),
  setQuery: (query) => set({ query }),
  setLibrary: (library) => {
    const ids = new Set(library.map((t) => t.id));
    const liked = Object.fromEntries(
      Object.entries(get().liked).filter(([id, isLiked]) => isLiked && ids.has(id)),
    );
    set({ library, liked });
    AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library)).catch(() => {});
    persistLiked(liked);
  },
  toggleLike: (id) => {
    const liked = { ...get().liked };
    if (liked[id]) delete liked[id];
    else liked[id] = true;
    set({ liked });
    persistLiked(liked);
  },
  setShuffle: (shuffle) => set({ shuffle }),
  setRepeat: (repeat) => set({ repeat }),
  setNpOpen: (npOpen) => set({ npOpen }),
  setScan: (scan) => set({ scan }),
  setExternalTrack: (externalTrack) => set({ externalTrack }),
  bumpQueueVersion: () => set({ queueVersion: get().queueVersion + 1 }),

  hydrate: async () => {
    try {
      const [libraryJson, likedJson] = await Promise.all([
        AsyncStorage.getItem(LIBRARY_KEY),
        AsyncStorage.getItem(LIKED_KEY),
      ]);
      const persisted: Track[] = libraryJson ? JSON.parse(libraryJson) : [];
      // Re-derive placeholder art so libraries persisted before GradientArt
      // gained `index` stay compatible.
      const library = persisted.map((t) => ({ ...t, art: artFor(`${t.album}|${t.artist}`) }));
      set({
        library,
        liked: likedJson ? JSON.parse(likedJson) : {},
        screen: library.length > 0 ? 'home' : 'onboarding',
        hydrated: true,
      });
      pruneDeadArtwork(library)
        .then((pruned) => pruned && get().setLibrary(pruned))
        .catch(() => {});
    } catch {
      set({ hydrated: true });
    }
  },
}));
