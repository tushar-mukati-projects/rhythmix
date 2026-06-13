import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SunsetGlow } from '@/features/onboarding/SunsetGlow';
import { VinylDisc } from '@/features/onboarding/VinylDisc';
import { scanLibrary } from '@/lib/scanner';
import { colors, fonts } from '@/lib/theme';
import { useAppStore } from '@/stores/app-store';

export const Scanning = () => {
  const scan = useAppStore((s) => s.scan);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const { setScan, setLibrary, setScreen } = useAppStore.getState();
    let lastUpdate = 0;
    let lastFolder = 'Music/';

    (async () => {
      try {
        const tracks = await scanLibrary((progress) => {
          lastFolder = progress.folder;
          const now = Date.now();
          if (now - lastUpdate > 80 || progress.pct >= 100) {
            lastUpdate = now;
            setScan(progress);
          }
        });
        setScan({ pct: 100, count: tracks.length, folder: lastFolder });
        setLibrary(tracks);
        setTimeout(() => setScreen('home'), 550);
      } catch (error) {
        console.warn('scan failed', error);
        setScreen('home');
      }
    })();
  }, []);

  return (
    <View style={styles.screen}>
      <SunsetGlow opacity={0.2} />
      <VinylDisc size={128} spinning />
      <Text style={styles.title}>Scanning your music…</Text>
      <Text style={styles.folder}>Looking in {scan.folder}</Text>
      <View style={styles.track}>
        <LinearGradient
          colors={['#F2A65A', colors.accent]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { width: `${scan.pct}%` }]}
        />
      </View>
      <Text style={styles.count}>{scan.count} SONGS FOUND</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.creamBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
  },
  title: {
    marginTop: 36,
    fontFamily: fonts.display,
    fontSize: 23,
    color: colors.ink,
  },
  folder: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.muted,
    minHeight: 22,
  },
  track: {
    marginTop: 28,
    width: 230,
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(43,33,24,0.1)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 99 },
  count: {
    marginTop: 16,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: colors.accent,
  },
});
