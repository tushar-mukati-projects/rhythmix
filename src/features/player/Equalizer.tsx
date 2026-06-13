import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme';

const BAR_HEIGHT = 15;

interface BarProps {
  index: number;
  playing: boolean;
}

const Bar = ({ index, playing }: BarProps) => {
  const height = useSharedValue(BAR_HEIGHT * 0.55);

  useEffect(() => {
    if (playing) {
      const duration = (750 + index * 140) / 2;
      height.value = withDelay(
        index * 120,
        withRepeat(
          withSequence(
            withTiming(BAR_HEIGHT, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(BAR_HEIGHT * 0.3, { duration, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
        ),
      );
    } else {
      cancelAnimation(height);
    }
    return () => cancelAnimation(height);
  }, [playing, index, height]);

  const style = useAnimatedStyle(() => ({ height: height.value }));
  return <Animated.View style={[styles.bar, style]} />;
};

export const Equalizer = ({ playing }: { playing: boolean }) => (
  <View style={styles.row}>
    {[0, 1, 2].map((i) => (
      <Bar key={i} index={i} playing={playing} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: BAR_HEIGHT,
  },
  bar: { width: 3.5, borderRadius: 2, backgroundColor: colors.accent },
});
