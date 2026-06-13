import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { MiniPlayer } from '@/features/player/MiniPlayer';
import { useAudioIntent, useSessionRestore } from '@/hooks/player';
import { setupPlayer } from '@/lib/player/setup';
import { colors } from '@/lib/theme';
import { Library } from '@/screens/Library';
import { NowPlaying } from '@/screens/NowPlaying';
import { Onboarding } from '@/screens/Onboarding';
import { Scanning } from '@/screens/Scanning';
import { Search } from '@/screens/Search';
import { useAppStore } from '@/stores/app-store';

const App = () => {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
  });
  const screen = useAppStore((s) => s.screen);
  const view = useAppStore((s) => s.view);
  const hydrated = useAppStore((s) => s.hydrated);
  useSessionRestore();
  useAudioIntent();

  useEffect(() => {
    useAppStore.getState().hydrate();
    setupPlayer().catch(() => {});
  }, []);

  if (!fontsLoaded || !hydrated) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {screen === 'onboarding' && <Onboarding />}
      {screen === 'scanning' && <Scanning />}
      {screen === 'home' && (
        <>
          {view === 'library' ? <Library /> : <Search />}
          <MiniPlayer />
          <NowPlaying />
        </>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.creamBg },
});
