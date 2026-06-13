import { State, usePlaybackState } from 'react-native-track-player';

export const useIsPlaying = (): boolean => {
  const playbackState = usePlaybackState();
  return playbackState.state === State.Playing;
};
