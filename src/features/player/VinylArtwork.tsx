import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
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

const REVOLUTION_MS = 9000;
const LABEL_RATIO = 0.62;

interface VinylArtworkProps {
  track: Track;
  size: number;
  playing: boolean;
}

const pieSlice = (cx: number, cy: number, r: number, fromDeg: number, toDeg: number) => {
  const point = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${cx + r * Math.sin(rad)} ${cy - r * Math.cos(rad)}`;
  };
  return `M ${cx} ${cy} L ${point(fromDeg)} A ${r} ${r} 0 0 1 ${point(toDeg)} Z`;
};

export const VinylArtwork = ({ track, size, playing }: VinylArtworkProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (playing) {
      rotation.value %= 360;
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, {
          duration: REVOLUTION_MS,
          easing: Easing.linear,
        }),
        -1,
      );
    } else {
      cancelAnimation(rotation);
    }
    return () => cancelAnimation(rotation);
  }, [playing, rotation]);

  const spin = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const c = size / 2;
  const labelR = (size * LABEL_RATIO) / 2;
  const labelBox = labelR * 2;
  const grooveRadii = [0.72, 0.8, 0.88, 0.95].map((r) => c * r);
  const { start, end } = gradientPoints(track.art.angle);
  const noteScale = (labelBox * 0.5) / 24;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, spin]}>
        <Svg width={size} height={size}>
          <Defs>
            <ClipPath id="labelClip">
              <Circle cx={c} cy={c} r={labelR} />
            </ClipPath>
            <LinearGradient
              id="labelGradient"
              x1={`${start.x * 100}%`}
              y1={`${start.y * 100}%`}
              x2={`${end.x * 100}%`}
              y2={`${end.y * 100}%`}
            >
              <Stop offset="0" stopColor={track.art.colors[0]} />
              <Stop offset="1" stopColor={track.art.colors[1]} />
            </LinearGradient>
          </Defs>

          <Circle cx={c} cy={c} r={c} fill="#2F2419" />
          {grooveRadii.map((r) => (
            <Circle
              key={r}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke="rgba(255,250,240,0.07)"
              strokeWidth={1.5}
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
              clipPath="url(#labelClip)"
            />
          ) : (
            <>
              <Circle cx={c} cy={c} r={labelR} fill="url(#labelGradient)" />
              <G
                transform={`translate(${c - 12 * noteScale}, ${c - 12 * noteScale}) scale(${noteScale})`}
                stroke="rgba(255,252,245,0.65)"
                strokeWidth={1.8}
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
            r={labelR + 0.75}
            fill="none"
            stroke="rgba(43,33,24,0.45)"
            strokeWidth={1.5}
          />
          <Circle cx={c} cy={c} r={size * 0.026} fill="#FAF4E8" />
          <Circle
            cx={c}
            cy={c}
            r={size * 0.026}
            fill="none"
            stroke="rgba(43,33,24,0.3)"
            strokeWidth={1}
          />
        </Svg>
      </Animated.View>

      {/* Static lighting: the sheen stays fixed while the record spins. */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="discSheen" cx="32%" cy="24%" r="70%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.16} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d={pieSlice(c, c, c, 206, 244)} fill="rgba(255,255,255,0.1)" />
        <Circle cx={c} cy={c} r={c} fill="url(#discSheen)" />
        <Circle
          cx={c}
          cy={c}
          r={c - 0.75}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1.5}
        />
      </Svg>
    </View>
  );
};
