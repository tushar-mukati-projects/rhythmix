import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
} from 'react-native-track-player';

let ready: Promise<void> | null = null;

const init = async (): Promise<void> => {
  try {
    await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
  } catch (error) {
    const alreadyInitialized =
      error instanceof Error && /already.*initialized/i.test(error.message);
    if (!alreadyInitialized) throw error;
  }
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
    ],
    progressUpdateEventInterval: 0.5,
  });
  await TrackPlayer.setRepeatMode(RepeatMode.Queue);
};

export const setupPlayer = (): Promise<void> => {
  if (!ready) {
    ready = init().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
};
