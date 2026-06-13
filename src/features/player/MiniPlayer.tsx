import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useProgress } from 'react-native-track-player';
import { ScaleButton } from '@/components/ui/ScaleButton';
import { NextIcon, PauseIcon, PlayIcon } from '@/components/ui/icons';
import { Artwork } from '@/features/player/Artwork';
import { useCurrentTrack, useIsPlaying } from '@/hooks/player';
import { nextTrack, togglePlayback } from '@/lib/player/controls';
import { colors, fonts, shadow } from '@/lib/theme';
import { useAppStore } from '@/stores/app-store';

export const MiniPlayer = () => {
  const setNpOpen = useAppStore((s) => s.setNpOpen);
  const current = useCurrentTrack();
  const playing = useIsPlaying();
  const { position, duration: liveDuration } = useProgress(500);

  if (!current) return null;
  const duration = current.duration || liveDuration;
  const pct = duration ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <Pressable onPress={() => setNpOpen(true)} style={[styles.card, shadow('#493118', 0.24, 36, 16, 10)]}>
      <Artwork track={current} size={46} radius={13} />
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {current.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {current.artist}
        </Text>
      </View>
      <ScaleButton onPress={() => togglePlayback()} pressedScale={0.88} style={styles.button}>
        {playing ? (
          <PauseIcon size={22} color={colors.ink} />
        ) : (
          <PlayIcon size={24} color={colors.ink} />
        )}
      </ScaleButton>
      <ScaleButton onPress={() => nextTrack()} pressedScale={0.88} style={[styles.button, styles.nextButton]}>
        <NextIcon size={22} color={colors.ink} />
      </ScaleButton>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 28,
    backgroundColor: colors.cardElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  meta: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  artist: { marginTop: 1, fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: { width: 36, marginLeft: -6 },
  progressTrack: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    height: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(43,33,24,0.07)',
  },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.accent },
});
