import { GradientArt } from '@/types';

const PALETTES: GradientArt[] = ([
  { colors: ['#F6B26B', '#E2674A'], angle: 135, glow: '#E2674A' },
  { colors: ['#E98F6F', '#B14E5E'], angle: 160, glow: '#B14E5E' },
  { colors: ['#F4CE6A', '#E08A4E'], angle: 140, glow: '#E08A4E' },
  { colors: ['#7B9DC9', '#46618F'], angle: 150, glow: '#46618F' },
  { colors: ['#F2A9A2', '#C96A8B'], angle: 145, glow: '#C96A8B' },
  { colors: ['#E8B27D', '#A65B43'], angle: 150, glow: '#A65B43' },
  { colors: ['#C98A5E', '#7E4A38'], angle: 140, glow: '#7E4A38' },
  { colors: ['#A86FA0', '#5F4B8B'], angle: 155, glow: '#5F4B8B' },
  { colors: ['#EE9E5F', '#C24E55'], angle: 140, glow: '#C24E55' },
  { colors: ['#D96E5B', '#8E3B58'], angle: 150, glow: '#8E3B58' },
  { colors: ['#F3C57E', '#D2694F'], angle: 135, glow: '#D2694F' },
  { colors: ['#F0D9A6', '#D49A57'], angle: 150, glow: '#D49A57' },
] as Omit<GradientArt, 'index'>[]).map((p, index) => ({ ...p, index }));

export const artFor = (key: string): GradientArt => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PALETTES[hash % PALETTES.length];
};

export const gradientPoints = (angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  const dx = Math.cos(rad) / 2;
  const dy = Math.sin(rad) / 2;
  return {
    start: { x: 0.5 - dx, y: 0.5 - dy },
    end: { x: 0.5 + dx, y: 0.5 + dy },
  };
};
