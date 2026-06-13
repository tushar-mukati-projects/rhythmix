import { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  creamBg: '#FAF4E8',
  card: '#FFFCF5',
  cardElevated: '#FFFDF6',
  ink: '#2B2118',
  muted: '#8C7A63',
  faint: '#B3A48C',
  label: '#A99A82',
  accent: '#2E7FC1',
  accentOn: '#FDFAF2',
  heart: '#E2674A',
  hairline: 'rgba(43,33,24,0.05)',
  rowPress: 'rgba(43,33,24,0.06)',
} as const;

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displayHeavy: 'BricolageGrotesque_800ExtraBold',
  body: 'HankenGrotesk_400Regular',
  bodyMedium: 'HankenGrotesk_500Medium',
  bodySemiBold: 'HankenGrotesk_600SemiBold',
  bodyBold: 'HankenGrotesk_700Bold',
  bodyHeavy: 'HankenGrotesk_800ExtraBold',
} as const;

export const sectionLabel: TextStyle = {
  fontFamily: fonts.bodyHeavy,
  fontSize: 12,
  letterSpacing: 1.4,
  color: colors.label,
};

export const shadow = (
  color: string,
  opacity: number,
  radius: number,
  offsetY: number,
  elevation = Math.round(radius / 2),
): ViewStyle => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: offsetY },
  elevation,
});

export const cardShadow = shadow('#493118', 0.1, 8, 2, 3);
export const warmInk = '#493118';
