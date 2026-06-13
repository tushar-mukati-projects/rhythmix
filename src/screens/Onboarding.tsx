import React from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { SearchIcon } from '@/components/ui/icons';
import { ScaleButton } from '@/components/ui/ScaleButton';
import { SunsetGlow } from '@/features/onboarding/SunsetGlow';
import { VinylDisc } from '@/features/onboarding/VinylDisc';
import { requestAudioPermission } from '@/lib/scanner';
import { colors, fonts, shadow } from '@/lib/theme';
import { useAppStore } from '@/stores/app-store';

export const Onboarding = () => {
  const setScreen = useAppStore((s) => s.setScreen);

  const startScan = async () => {
    if (await requestAudioPermission()) {
      setScreen('scanning');
    } else {
      Alert.alert(
        'Permission needed',
        'Rhythmix needs access to your audio files to build your library.',
        [
          { text: 'Not now' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  return (
    <View style={styles.screen}>
      <SunsetGlow />
      <VinylDisc size={122} />
      <Text style={styles.wordmark}>Rhythmix</Text>
      <Text style={styles.tagline}>All the music on this phone, beautifully played.</Text>
      <ScaleButton
        onPress={startScan}
        pressedScale={0.95}
        style={[styles.cta, shadow(colors.accent, 0.38, 26, 12, 8)]}
      >
        <SearchIcon size={18} color={colors.accentOn} />
        <Text style={styles.ctaText}>Scan my music</Text>
      </ScaleButton>
      <Text style={styles.footnote}>MP3 · FLAC · WAV — nothing ever leaves your phone</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.creamBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  wordmark: {
    marginTop: 30,
    fontFamily: fonts.displayHeavy,
    fontSize: 46,
    letterSpacing: -1.5,
    color: colors.ink,
  },
  tagline: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 16.5,
    lineHeight: 25,
    color: colors.muted,
    maxWidth: 250,
    textAlign: 'center',
  },
  cta: {
    marginTop: 42,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.accentOn },
  footnote: {
    marginTop: 18,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.faint,
    textAlign: 'center',
  },
});
