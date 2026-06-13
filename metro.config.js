const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @missingcore/audio-metadata targets the pre-SDK-54 expo-file-system API,
// which now lives at expo-file-system/legacy.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'expo-file-system' &&
    context.originModulePath.includes('@missingcore')
  ) {
    return context.resolveRequest(context, 'expo-file-system/legacy', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
