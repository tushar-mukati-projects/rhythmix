import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useProgress } from 'react-native-track-player';
import { CircleButton } from '@/components/ui/CircleButton';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  NextIcon,
  RepeatIcon,
  ShuffleIcon,
} from '@/components/ui/icons';
import { ScaleButton } from '@/components/ui/ScaleButton';
import { Artwork } from '@/features/player/Artwork';
import { VinylArtwork } from '@/features/player/VinylArtwork';
import { useCurrentTrack, useIsPlaying, useNextUp } from '@/hooks/player';
import { formatTime } from '@/lib/format';
import {
  applyShuffle,
  nextTrack,
  prevTrack,
  seekTo,
  setRepeat as setPlayerRepeat,
  togglePlayback,
} from '@/lib/player/controls';
import { colors, fonts, shadow } from '@/lib/theme';
import { useAppStore } from '@/stores/app-store';

const SLIDE_EASING = Easing.bezier(0.32, 0.72, 0.16, 1);
const ART_EASING = Easing.bezier(0.34, 1.4, 0.5, 1);

export const NowPlaying = () => {
  const { width, height } = useWindowDimensions();
  const npOpen = useAppStore((s) => s.npOpen);
  const setNpOpen = useAppStore((s) => s.setNpOpen);
  const liked = useAppStore((s) => s.liked);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const shuffle = useAppStore((s) => s.shuffle);
  const setShuffle = useAppStore((s) => s.setShuffle);
  const repeat = useAppStore((s) => s.repeat);
  const setRepeat = useAppStore((s) => s.setRepeat);
  const library = useAppStore((s) => s.library);
  const current = useCurrentTrack();
  const playing = useIsPlaying();
  const nextUp = useNextUp();
  const { position, duration: liveDuration } = useProgress(500);

  const shift = useSharedValue(height * 1.03);
  const artScale = useSharedValue(1);

  useEffect(() => {
    shift.value = withTiming(npOpen ? 0 : height * 1.03, {
      duration: 550,
      easing: SLIDE_EASING,
    });
  }, [npOpen, height, shift]);

  useEffect(() => {
    if (!npOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setNpOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [npOpen, setNpOpen]);

  useEffect(() => {
    artScale.value = withTiming(playing ? 1 : 0.9, {
      duration: 450,
      easing: ART_EASING,
    });
  }, [playing, artScale]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: shift.value }],
  }));
  const artStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artScale.value }],
  }));

  const [trackWidth, setTrackWidth] = useState(1);
  const [dragPct, setDragPct] = useState<number | null>(null);

  if (!current) return null;

  const isLiked = !!liked[current.id];
  const duration = current.duration || liveDuration || 1;
  const pct =
    dragPct ?? Math.min(100, (position / duration) * 100);
  const elapsed = dragPct != null ? (dragPct / 100) * duration : position;
  const artSize = Math.min(308, width - 72);

  const pctFromEvent = (e: GestureResponderEvent) =>
    Math.max(0, Math.min(100, (e.nativeEvent.locationX / trackWidth) * 100));

  const toggleShuffle = () => {
    const next = !shuffle;
    setShuffle(next);
    applyShuffle(next, library);
  };

  const toggleRepeat = () => {
    const next = !repeat;
    setRepeat(next);
    setPlayerRepeat(next);
  };

  return (
    <Animated.View
      style={[styles.overlay, slideStyle]}
      pointerEvents={npOpen ? 'auto' : 'none'}
    >
      <LinearGradient
        colors={[`${current.art.glow}55`, `${current.art.glow}00`]}
        style={[StyleSheet.absoluteFill, { height: height * 0.52 }]}
      />

      <View style={styles.headerRow}>
        <CircleButton onPress={() => setNpOpen(false)} size={38} pressedScale={0.9} style={styles.translucent}>
          <ChevronDownIcon size={16} color={colors.ink} />
        </CircleButton>
        <View style={styles.headerCenter}>
          <Text style={styles.playingFrom}>PLAYING FROM</Text>
          <Text style={styles.sourceName}>Local Library</Text>
        </View>
        <View style={{ width: 38, height: 38 }} />
      </View>

      <View style={styles.artZone}>
        <Animated.View
          style={[
            { borderRadius: artSize / 2 },
            shadow(current.art.glow, 0.4, 70, 34, 16),
            artStyle,
          ]}
        >
          <VinylArtwork track={current} size={artSize} playing={playing} />
        </Animated.View>
      </View>

      <View>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text numberOfLines={1} style={styles.songTitle}>
              {current.title}
            </Text>
            <Text numberOfLines={1} style={styles.songMeta}>
              {current.artist} · {current.album}
            </Text>
          </View>
          <CircleButton
            onPress={() => toggleLike(current.id)}
            size={42}
            pressedScale={0.85}
            style={styles.translucent}
          >
            <HeartIcon
              size={19}
              color={isLiked ? colors.heart : colors.ink}
              fill={isLiked ? colors.heart : 'none'}
            />
          </CircleButton>
        </View>

        <View
          style={styles.scrubber}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => setDragPct(pctFromEvent(e))}
          onResponderMove={(e) => setDragPct(pctFromEvent(e))}
          onResponderRelease={(e) => {
            seekTo((pctFromEvent(e) / 100) * duration);
            setDragPct(null);
          }}
          onResponderTerminate={() => setDragPct(null)}
        >
          <View style={styles.scrubTrack} pointerEvents="none">
            <View style={[styles.scrubFill, { width: `${pct}%` }]} />
            <View style={[styles.thumb, { left: `${pct}%` }]} />
          </View>
        </View>
        <View style={styles.timesRow}>
          <Text style={styles.time}>{formatTime(elapsed)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.transport}>
          <ScaleButton onPress={toggleShuffle} pressedScale={0.85} style={styles.toggle}>
            <ShuffleIcon size={21} color={shuffle ? colors.accent : colors.label} />
          </ScaleButton>
          <ScaleButton onPress={() => prevTrack()} pressedScale={0.85} style={styles.skip}>
            <PrevIcon size={30} color={colors.ink} />
          </ScaleButton>
          <ScaleButton
            onPress={() => togglePlayback()}
            pressedScale={0.92}
            style={[styles.playButton, shadow(colors.accent, 0.4, 30, 14, 10)]}
          >
            {playing ? (
              <PauseIcon size={28} color={colors.accentOn} />
            ) : (
              <PlayIcon size={32} color={colors.accentOn} />
            )}
          </ScaleButton>
          <ScaleButton onPress={() => nextTrack()} pressedScale={0.85} style={styles.skip}>
            <NextIcon size={30} color={colors.ink} />
          </ScaleButton>
          <ScaleButton onPress={toggleRepeat} pressedScale={0.85} style={styles.toggle}>
            <RepeatIcon size={21} color={repeat ? colors.accent : colors.label} />
          </ScaleButton>
        </View>

        {nextUp && (
          <Pressable onPress={() => nextTrack()} style={styles.upNext}>
            <Artwork track={nextUp} size={38} radius={11} />
            <View style={styles.upNextMeta}>
              <Text style={styles.upNextLabel}>UP NEXT</Text>
              <Text numberOfLines={1} style={styles.upNextTitle}>
                {nextUp.title} ·{' '}
                <Text style={styles.upNextArtist}>{nextUp.artist}</Text>
              </Text>
            </View>
            <ChevronRightIcon size={14} color={colors.faint} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
    elevation: 30,
    backgroundColor: colors.creamBg,
    paddingTop: 66,
    paddingHorizontal: 26,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: { alignItems: 'center' },
  playingFrom: {
    fontFamily: fonts.bodyHeavy,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.label,
  },
  sourceName: {
    marginTop: 2,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  translucent: { backgroundColor: 'rgba(255,253,246,0.7)' },
  artZone: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  titleBlock: { flex: 1, minWidth: 0 },
  songTitle: {
    fontFamily: fonts.displayHeavy,
    fontSize: 25,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  songMeta: { marginTop: 3, fontFamily: fonts.body, fontSize: 16, color: colors.muted },
  scrubber: { marginTop: 18, paddingVertical: 8 },
  scrubTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(43,33,24,0.12)',
  },
  scrubFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 99,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    top: 3,
    width: 15,
    height: 15,
    marginLeft: -7.5,
    marginTop: -7.5,
    borderRadius: 8,
    backgroundColor: colors.accentOn,
    borderWidth: 1,
    borderColor: 'rgba(43,33,24,0.08)',
    ...shadow('#2B2118', 0.35, 8, 2, 3),
  },
  timesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.muted },
  transport: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: { flex: 1, alignItems: 'center', padding: 10 },
  skip: { flex: 1, alignItems: 'center', padding: 8 },
  playButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upNext: {
    marginTop: 18,
    backgroundColor: 'rgba(255,253,246,0.75)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upNextMeta: { flex: 1, minWidth: 0 },
  upNextLabel: {
    fontFamily: fonts.bodyHeavy,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: colors.label,
  },
  upNextTitle: {
    marginTop: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  upNextArtist: { fontFamily: fonts.bodyMedium, color: colors.muted },
});
