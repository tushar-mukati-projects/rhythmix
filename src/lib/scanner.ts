import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system/legacy';
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { artFor } from '@/lib/art';
import { ScanProgress, Track } from '@/types';

const PAGE_SIZE = 64;
const METADATA_CONCURRENCY = 8;

export const requestAudioPermission = async (): Promise<boolean> => {
  const { status } = await MediaLibrary.requestPermissionsAsync(false, ['audio']);
  return status === 'granted';
};

export const scanLibrary = async (
  onProgress: (progress: ScanProgress) => void,
): Promise<Track[]> => {
  const tracks: Track[] = [];
  let cursor: MediaLibrary.AssetRef | undefined;
  let processed = 0;
  let total = 0;

  do {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      first: PAGE_SIZE,
      after: cursor,
    });
    total = page.totalCount;

    for (let i = 0; i < page.assets.length; i += METADATA_CONCURRENCY) {
      const chunk = page.assets.slice(i, i + METADATA_CONCURRENCY);
      tracks.push(...(await Promise.all(chunk.map(toTrack))));
      processed += chunk.length;
      onProgress({
        pct: total ? Math.min(100, (processed / total) * 100) : 100,
        count: processed,
        folder: folderOf(chunk[chunk.length - 1].uri),
      });
    }
    cursor = page.hasNextPage ? page.endCursor : undefined;
  } while (cursor);

  return tracks;
};

const toTrack = async (asset: MediaLibrary.Asset): Promise<Track> => {
  const fallbackTitle = asset.filename.replace(/\.[^.]+$/, '');
  let title = fallbackTitle;
  let artist = 'Unknown artist';
  let album = 'Unknown album';
  let artworkUri: string | undefined;

  try {
    const { metadata } = await getAudioMetadata(asset.uri, [
      'name',
      'artist',
      'album',
      'artwork',
    ]);
    title = metadata.name?.trim() || fallbackTitle;
    artist = metadata.artist?.trim() || artist;
    album = metadata.album?.trim() || album;
    if (metadata.artwork) {
      artworkUri = await cacheArtwork(asset.id, metadata.artwork);
    }
  } catch {
    // Unsupported format or unreadable tags — keep filename-derived fields.
  }

  return {
    id: asset.id,
    uri: asset.uri,
    title,
    artist,
    album,
    duration: asset.duration,
    artworkUri,
    art: artFor(`${album}|${artist}`),
  };
};

const cacheArtwork = async (id: string, dataUri: string): Promise<string | undefined> => {
  const match = dataUri.match(/^data:image\/(\w+);base64,(.+)$/s);
  if (!match) return undefined;
  const file = `${FileSystem.cacheDirectory}artwork-${id.replace(/\W/g, '')}.${match[1]}`;
  try {
    await FileSystem.writeAsStringAsync(file, match[2], {
      encoding: FileSystem.EncodingType.Base64,
    });
    return file;
  } catch {
    return undefined;
  }
};

const folderOf = (uri: string): string => {
  const parts = decodeURIComponent(uri).split('/');
  return parts.length > 1 ? `${parts[parts.length - 2]}/` : 'Music/';
};
