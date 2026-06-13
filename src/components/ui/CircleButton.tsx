import React, { PropsWithChildren } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { ScaleButton } from '@/components/ui/ScaleButton';
import { cardShadow, colors } from '@/lib/theme';

interface CircleButtonProps {
  onPress: () => void;
  size?: number;
  pressedScale?: number;
  style?: ViewStyle;
}

export const CircleButton = ({
  onPress,
  size = 40,
  pressedScale = 0.92,
  style,
  children,
}: PropsWithChildren<CircleButtonProps>) => (
  <ScaleButton
    onPress={onPress}
    pressedScale={pressedScale}
    style={[
      styles.base,
      cardShadow,
      { width: size, height: size, borderRadius: size / 2 },
      style,
    ]}
  >
    {children}
  </ScaleButton>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
