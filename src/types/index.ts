export interface GradientArt {
  index: number;
  colors: [string, string];
  angle: number;
  glow: string;
}

export interface Track {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artworkUri?: string;
  art: GradientArt;
}

export type Screen = 'onboarding' | 'scanning' | 'home';
export type LibraryView = 'library' | 'search';

export interface ScanProgress {
  pct: number;
  count: number;
  folder: string;
}
