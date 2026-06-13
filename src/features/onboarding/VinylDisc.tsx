import React, { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { shadow } from '@/lib/theme';

interface VinylDiscProps {
  size: number;
  spinning?: boolean;
}

const pieSlice = (cx: number, cy: number, r: number, fromDeg: number, toDeg: number) => {
  const point = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${cx + r * Math.sin(rad)} ${cy - r * Math.cos(rad)}`;
  };
  return `M ${cx} ${cy} L ${point(fromDeg)} A ${r} ${r} 0 0 1 ${point(toDeg)} Z`;
};

export const VinylDisc = ({ size, spinning }: VinylDiscProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (spinning) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2600, easing: Easing.linear }),
        -1,
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
    return () => cancelAnimation(rotation);
  }, [spinning, rotation]);

  const spin = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const k = size / 122;
  const c = size / 2;
  const wedge = pieSlice(c, c, c, 210, 248);

  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: '#2F2419' },
        shadow('#493118', 0.3, 22, 20, 12),
      ]}
    >
      <Animated.View style={spin}>
        <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={c} fill="#2F2419" />
        {[40, 47, 54].map((r) => (
          <Circle
            key={r}
            cx={c}
            cy={c}
            r={r * k}
            fill="none"
            stroke="rgba(255,250,240,0.06)"
            strokeWidth={1.5}
          />
        ))}
        <Circle cx={c} cy={c} r={36 * k} fill="#F2A65A" />
        <Circle cx={c} cy={c} r={23 * k} fill="#E2674A" />
        <Circle cx={c} cy={c} r={6 * k} fill="#FAF4E8" />
        <Path d={wedge} fill="rgba(255,255,255,0.14)" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};
