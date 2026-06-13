import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { playbackService } from './src/lib/player/service';

registerRootComponent(App);
TrackPlayer.registerPlaybackService(() => playbackService);
