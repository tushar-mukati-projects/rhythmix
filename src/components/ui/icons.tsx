import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

const stroke = (color: string, strokeWidth = 2.4) => ({
  fill: 'none',
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const SearchIcon = ({ size = 17, color, strokeWidth = 2.4 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
    <Circle cx={11} cy={11} r={7} />
    <Path d="M21 21l-4.3-4.3" />
  </Svg>
);

export const MusicNoteIcon = ({ size = 20, color, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
    <Path d="M9 18V5l12-2v13" />
    <Circle cx={6} cy={18} r={3} />
    <Circle cx={18} cy={16} r={3} />
  </Svg>
);

export const BackIcon = ({ size = 16, color }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
    <Path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const ChevronDownIcon = ({ size = 16, color }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
    <Path d="M5 9l7 7 7-7" />
  </Svg>
);

export const ChevronRightIcon = ({ size = 14, color }: IconProps) => (
  <Svg width={size * 0.64} height={size} viewBox="0 0 8 14" {...stroke(color, 2)}>
    <Path d="M1 1l6 6-6 6" />
  </Svg>
);

export const PlayIcon = ({ size = 24, color }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M8 5.5v13l11-6.5z" />
  </Svg>
);

export const PauseIcon = ({ size = 22, color }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Rect x={6} y={5} width={4.5} height={14} rx={1.5} />
    <Rect x={13.5} y={5} width={4.5} height={14} rx={1.5} />
  </Svg>
);

export const NextIcon = ({ size = 22, color }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M5 5.5v13l9.5-6.5z" />
    <Rect x={16.5} y={5.5} width={2.6} height={13} rx={1.3} />
  </Svg>
);

export const PrevIcon = ({ size = 30, color }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M19 5.5v13L9.5 12z" />
    <Rect x={4.9} y={5.5} width={2.6} height={13} rx={1.3} />
  </Svg>
);

export const ShuffleIcon = ({ size = 21, color, strokeWidth = 2.2 }: IconProps) => (
  // key forces remount: react-native-svg doesn't re-propagate inherited stroke on update
  <Svg key={color} width={size} height={size} viewBox="0 0 24 24" {...stroke(color, strokeWidth)}>
    <Path d="M16 3h5v5" />
    <Path d="M4 20L21 3" />
    <Path d="M21 16v5h-5" />
    <Path d="M15 15l6 6" />
    <Path d="M4 4l5 5" />
  </Svg>
);

export const RepeatIcon = ({ size = 21, color }: IconProps) => (
  <Svg key={color} width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.2)}>
    <Path d="M17 1l4 4-4 4" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <Path d="M7 23l-4-4 4-4" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
);

export const HeartIcon = ({
  size = 19,
  color,
  fill = 'none',
}: IconProps & { fill?: string }) => (
  <Svg
    key={`${color}-${fill}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);
