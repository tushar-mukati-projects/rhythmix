import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Equalizer } from '@/features/player/Equalizer';
import { VinylThumb } from '@/features/player/VinylThumb';
import { formatTime } from '@/lib/format';
import { colors, fonts, shadow } from '@/lib/theme';
import { Track } from '@/types';

interface TrackRowProps {
  track: Track;
  isCurrent: boolean;
  playing: boolean;
  onPress: (track: Track) => void;
}

export const TrackRow = React.memo(({ track, isCurrent, playing, onPress }: TrackRowProps) => (
  <Pressable
    onPress={() => onPress(track)}
    style={({ pressed }) => [
      styles.row,
      pressed && { backgroundColor: colors.rowPress },
    ]}
  >
    <View style={[styles.art, shadow('#493118', 0.18, 8, 3)]}>
      <VinylThumb track={track} size={50} />
    </View>
    <View style={styles.meta}>
      <Text
        numberOfLines={1}
        style={[styles.title, isCurrent && { color: colors.accent }]}
      >
        {track.title}
      </Text>
      <Text numberOfLines={1} style={styles.subtitle}>
        {track.artist} · {track.album}
      </Text>
    </View>
    {isCurrent ? (
      <Equalizer playing={playing} />
    ) : (
      <Text style={styles.duration}>{formatTime(track.duration)}</Text>
    )}
  </Pressable>
));

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 9,
    paddingHorizontal: 22,
  },
  art: { borderRadius: 25 },
  meta: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.bodyBold, fontSize: 15.5, color: colors.ink },
  subtitle: {
    marginTop: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
  duration: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.faint },
});
