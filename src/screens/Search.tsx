import React, { useCallback, useEffect } from 'react';
import { BackHandler, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { CircleButton } from '@/components/ui/CircleButton';
import { BackIcon, SearchIcon } from '@/components/ui/icons';
import { TrackRow } from '@/features/library/TrackRow';
import { useSearchResults } from '@/hooks/library';
import { useCurrentTrack, useIsPlaying } from '@/hooks/player';
import { playTrack } from '@/lib/player/controls';
import { colors, fonts, shadow } from '@/lib/theme';
import { useAppStore } from '@/stores/app-store';
import { Track } from '@/types';

export const Search = () => {
  const query = useAppStore((s) => s.query);
  const setQuery = useAppStore((s) => s.setQuery);
  const closeSearch = useAppStore((s) => s.closeSearch);
  const current = useCurrentTrack();
  const playing = useIsPlaying();
  const results = useSearchResults();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeSearch();
      return true;
    });
    return () => sub.remove();
  }, [closeSearch]);

  const play = useCallback(
    (track: Track) =>
      playTrack(useAppStore.getState().library, track.id, useAppStore.getState().shuffle),
    [],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <CircleButton onPress={closeSearch}>
          <BackIcon size={16} color={colors.ink} />
        </CircleButton>
        <View style={[styles.field, shadow('#493118', 0.08, 8, 2, 2)]}>
          <SearchIcon size={16} color={colors.label} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Songs, artists, albums…"
            placeholderTextColor={colors.faint}
            style={styles.input}
          />
        </View>
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          {query.trim() ? (
            <>
              <Text style={styles.emptyTitle}>No matches for “{query}”</Text>
              <Text style={styles.emptyBody}>Try a different song, artist or album name.</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>Your library is empty</Text>
              <Text style={styles.emptyBody}>Pull down on the library to rescan this phone.</Text>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={12}
          windowSize={9}
          removeClippedSubviews
          getItemLayout={(_, index) => ({ length: 68, offset: 6 + 68 * index, index })}
          renderItem={({ item }) => (
            <TrackRow
              track={item}
              isCurrent={item.id === current?.id}
              playing={item.id === current?.id && playing}
              onPress={play}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.creamBg },
  header: {
    paddingTop: 68,
    paddingHorizontal: 22,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  field: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(43,33,24,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.ink,
    padding: 0,
  },
  listContent: { paddingTop: 6, paddingBottom: 130 },
  empty: { paddingVertical: 80, paddingHorizontal: 40, alignItems: 'center' },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
});
