import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleButton } from '@/components/ui/CircleButton';
import { PlayIcon, SearchIcon, ShuffleIcon } from '@/components/ui/icons';
import { ScaleButton } from '@/components/ui/ScaleButton';
import { TrackRow } from '@/features/library/TrackRow';
import { Artwork } from '@/features/player/Artwork';
import { useRecents } from '@/hooks/library';
import { useCurrentTrack, useIsPlaying } from '@/hooks/player';
import { playTrack } from '@/lib/player/controls';
import { requestAudioPermission, scanLibrary } from '@/lib/scanner';
import { cardShadow, colors, fonts, sectionLabel, shadow } from '@/lib/theme';
import { useAppStore } from '@/stores/app-store';
import { Track } from '@/types';

export const Library = () => {
  const library = useAppStore((s) => s.library);
  const shuffle = useAppStore((s) => s.shuffle);
  const setShuffle = useAppStore((s) => s.setShuffle);
  const openSearch = useAppStore((s) => s.openSearch);
  const current = useCurrentTrack();
  const playing = useIsPlaying();
  const recents = useRecents();
  const [refreshing, setRefreshing] = useState(false);

  const rescan = useCallback(async () => {
    setRefreshing(true);
    try {
      if (await requestAudioPermission()) {
        const tracks = await scanLibrary(() => {});
        useAppStore.getState().setLibrary(tracks);
      }
    } catch (error) {
      console.warn('rescan failed', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const play = useCallback(
    (track: Track) => playTrack(useAppStore.getState().library, track.id, useAppStore.getState().shuffle),
    [],
  );

  const playAll = () => {
    if (library.length) play(library[0]);
  };

  const shuffleAll = () => {
    if (!library.length) return;
    setShuffle(true);
    const random = library[Math.floor(Math.random() * library.length)];
    playTrack(library, random.id, true);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <Text style={styles.brandText}>Rhythmix</Text>
            <LinearGradient
              colors={['#F2A65A', '#E2674A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.brandDot}
            />
          </View>
          <CircleButton onPress={openSearch}>
            <SearchIcon size={17} color={colors.ink} />
          </CircleButton>
        </View>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>{library.length} songs · stored on this phone</Text>
        <View style={styles.actions}>
          <ScaleButton
            onPress={playAll}
            pressedScale={0.96}
            style={[styles.action, styles.actionPrimary, shadow(colors.accent, 0.3, 18, 8, 6)]}
          >
            <PlayIcon size={15} color={colors.accentOn} />
            <Text style={styles.actionPrimaryText}>Play</Text>
          </ScaleButton>
          <ScaleButton
            onPress={shuffleAll}
            pressedScale={0.96}
            style={[styles.action, styles.actionSecondary, cardShadow]}
          >
            <ShuffleIcon size={16} color={colors.ink} />
            <Text style={styles.actionSecondaryText}>Shuffle</Text>
          </ScaleButton>
        </View>
      </View>

      <FlatList
        data={library}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={9}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={rescan}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.card}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={[sectionLabel, styles.recentsLabel]}>RECENTLY ADDED</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentsRow}
            >
              {recents.map((track) => (
                <Pressable key={track.id} onPress={() => play(track)} style={styles.recentCard}>
                  <View style={[styles.recentArt, shadow('#493118', 0.18, 22, 10, 6)]}>
                    <Artwork track={track} size={128} radius={20} />
                  </View>
                  <Text numberOfLines={1} style={styles.recentAlbum}>
                    {track.album}
                  </Text>
                  <Text numberOfLines={1} style={styles.recentArtist}>
                    {track.artist}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={[sectionLabel, styles.allSongsLabel]}>ALL SONGS</Text>
          </>
        }
        renderItem={({ item }) => (
          <TrackRow
            track={item}
            isCurrent={item.id === current?.id}
            playing={item.id === current?.id && playing}
            onPress={play}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.creamBg },
  header: { paddingTop: 68, paddingHorizontal: 22, paddingBottom: 14 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandText: {
    fontFamily: fonts.displayHeavy,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  brandDot: { width: 9, height: 9, borderRadius: 5 },
  title: {
    marginTop: 18,
    fontFamily: fonts.displayHeavy,
    fontSize: 34,
    letterSpacing: -1,
    color: colors.ink,
    lineHeight: 36,
  },
  subtitle: { marginTop: 6, fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  actions: { marginTop: 16, flexDirection: 'row', gap: 10 },
  action: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionPrimary: { backgroundColor: colors.accent },
  actionPrimaryText: { fontFamily: fonts.bodyBold, fontSize: 15.5, color: colors.accentOn },
  actionSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  actionSecondaryText: { fontFamily: fonts.bodyBold, fontSize: 15.5, color: colors.ink },
  listContent: { paddingBottom: 130 },
  recentsLabel: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 10 },
  recentsRow: { paddingHorizontal: 22, paddingTop: 2, paddingBottom: 8, gap: 14 },
  recentCard: { width: 128 },
  recentArt: { borderRadius: 20 },
  recentAlbum: { marginTop: 9, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  recentArtist: { marginTop: 1, fontFamily: fonts.body, fontSize: 12.5, color: colors.muted },
  allSongsLabel: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 6 },
});
