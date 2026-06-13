import React, { PropsWithChildren } from 'react';
import { Insets, Pressable, StyleProp, ViewStyle } from 'react-native';

interface ScaleButtonProps {
  onPress?: () => void;
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
  hitSlop?: Insets | number;
}

export const ScaleButton = ({
  onPress,
  pressedScale = 0.92,
  style,
  hitSlop,
  children,
}: PropsWithChildren<ScaleButtonProps>) => (
  <Pressable
    onPress={onPress}
    hitSlop={hitSlop}
    style={({ pressed }) => [
      style,
      { transform: [{ scale: pressed ? pressedScale : 1 }] },
    ]}
  >
    {children}
  </Pressable>
);
