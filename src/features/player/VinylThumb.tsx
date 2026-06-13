import React from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Image as SvgImage,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { gradientPoints } from '@/lib/art';
import { Track } from '@/types';

const LABEL_RATIO = 0.62;

interface VinylThumbProps {
  track: Track;
  size: number;
}

// Static (non-spinning) vinyl for list rows and the album rail — mirrors the
// player's disc but in a single lightweight SVG so it's cheap per FlatList row.
export const VinylThumb = React.memo(({ track, size }: VinylThumbProps) => {
  const c = size / 2;
  const labelR = (size * LABEL_RATIO) / 2;
  const labelBox = labelR * 2;
  const grooveRadii = [0.78, 0.88, 0.96].map((r) => c * r);
  const { start, end } = gradientPoints(track.art.angle);
  const noteScale = (labelBox * 0.5) / 24;
  const uid = track.id.replace(/\W/g, '');

  return (
    <Svg width={size} height={size}>
      <Defs>
        <ClipPath id={`clip-${uid}`}>
          <Circle cx={c} cy={c} r={labelR} />
        </ClipPath>
        <LinearGradient
          id={`grad-${uid}`}
          x1={`${start.x * 100}%`}
          y1={`${start.y * 100}%`}
          x2={`${end.x * 100}%`}
          y2={`${end.y * 100}%`}
        >
          <Stop offset="0" stopColor={track.art.colors[0]} />
          <Stop offset="1" stopColor={track.art.colors[1]} />
        </LinearGradient>
        <RadialGradient id={`sheen-${uid}`} cx="32%" cy="24%" r="70%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.16} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Circle cx={c} cy={c} r={c} fill="#2F2419" />
      {grooveRadii.map((r) => (
        <Circle
          key={r}
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="rgba(255,250,240,0.08)"
          strokeWidth={1}
        />
      ))}

      {track.artworkUri ? (
        <SvgImage
          href={{ uri: track.artworkUri }}
          x={c - labelR}
          y={c - labelR}
          width={labelBox}
          height={labelBox}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#clip-${uid})`}
        />
      ) : (
        <>
          <Circle cx={c} cy={c} r={labelR} fill={`url(#grad-${uid})`} />
          <G
            transform={`translate(${c - 12 * noteScale}, ${c - 12 * noteScale}) scale(${noteScale})`}
            stroke="rgba(255,252,245,0.7)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <Path d="M9 18V5l12-2v13" />
            <Circle cx={6} cy={18} r={3} />
            <Circle cx={18} cy={16} r={3} />
          </G>
        </>
      )}

      <Circle
        cx={c}
        cy={c}
        r={labelR + 0.5}
        fill="none"
        stroke="rgba(43,33,24,0.45)"
        strokeWidth={1}
      />
      <Circle cx={c} cy={c} r={Math.max(1.3, size * 0.03)} fill="#FAF4E8" />

      <Circle cx={c} cy={c} r={c} fill={`url(#sheen-${uid})`} />
      <Circle
        cx={c}
        cy={c}
        r={c - 0.5}
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={1}
      />
    </Svg>
  );
});
