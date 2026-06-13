import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { MusicNoteIcon } from '@/components/ui/icons';
import { gradientPoints } from '@/lib/art';
import { fonts } from '@/lib/theme';
import { Track } from '@/types';

interface ArtworkProps {
  track: Track;
  size: number;
  radius: number;
  showInitial?: boolean;
}

export const Artwork = React.memo(({ track, size, radius, showInitial }: ArtworkProps) => {
  const box = { width: size, height: size, borderRadius: radius };

  if (track.artworkUri) {
    return (
      <Image source={{ uri: track.artworkUri }} style={[box, styles.clip]} />
    );
  }

  const { start, end } = gradientPoints(track.art.angle);
  return (
    <LinearGradient
      colors={track.art.colors}
      start={start}
      end={end}
      style={[box, styles.clip]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="sheen" cx="30%" cy="22%" r="58%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.32} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill="url(#sheen)" />
      </Svg>
      {showInitial ? (
        <View style={styles.overlay} pointerEvents="none">
          <Text
            style={[styles.initial, { fontSize: size * 0.75, right: size * 0.02, bottom: -size * 0.22 }]}
            numberOfLines={1}
          >
            {track.title.charAt(0)}
          </Text>
        </View>
      ) : (
        <View style={[styles.overlay, styles.noteWrap]} pointerEvents="none">
          <MusicNoteIcon
            size={size * 0.42}
            color="rgba(255,252,245,0.65)"
            strokeWidth={size > 100 ? 1.6 : 2}
          />
        </View>
      )}
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFill },
  noteWrap: { alignItems: 'center', justifyContent: 'center' },
  initial: {
    position: 'absolute',
    fontFamily: fonts.displayHeavy,
    color: 'rgba(255,252,245,0.22)',
    includeFontPadding: false,
  },
});
