import { GradientArt } from '@/types';

// Pre-rendered palette tiles (scripts/generate-art.mjs) for media notification artwork.
const FALLBACK_ART = [
  require('../../assets/art/palette-0.png'),
  require('../../assets/art/palette-1.png'),
  require('../../assets/art/palette-2.png'),
  require('../../assets/art/palette-3.png'),
  require('../../assets/art/palette-4.png'),
  require('../../assets/art/palette-5.png'),
  require('../../assets/art/palette-6.png'),
  require('../../assets/art/palette-7.png'),
  require('../../assets/art/palette-8.png'),
  require('../../assets/art/palette-9.png'),
  require('../../assets/art/palette-10.png'),
  require('../../assets/art/palette-11.png'),
];

export const fallbackArtFor = (art: GradientArt) => FALLBACK_ART[art.index % FALLBACK_ART.length];
