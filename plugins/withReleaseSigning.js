const { withAppBuildGradle } = require('@expo/config-plugins');

// Injects a release signingConfig into the generated android/app/build.gradle
// so local release builds (APK/AAB) are signed with the upload keystore. The
// actual secrets live in ~/.gradle/gradle.properties (never committed); when
// those properties are absent the build falls back to the debug key.
const RELEASE_SIGNING_BLOCK = `
        release {
            if (project.hasProperty('RHYTHMIX_UPLOAD_STORE_FILE')) {
                storeFile file(RHYTHMIX_UPLOAD_STORE_FILE)
                storePassword RHYTHMIX_UPLOAD_STORE_PASSWORD
                keyAlias RHYTHMIX_UPLOAD_KEY_ALIAS
                keyPassword RHYTHMIX_UPLOAD_KEY_PASSWORD
            }
        }`;

const withReleaseSigning = (config) =>
  withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (gradle.includes('RHYTHMIX_UPLOAD_STORE_FILE')) return cfg;

    gradle = gradle.replace(/signingConfigs\s*\{/, (m) => `${m}${RELEASE_SIGNING_BLOCK}`);

    gradle = gradle.replace(
      /(signed-apk-android\.[^\n]*\n\s*)signingConfig signingConfigs\.debug/,
      `$1signingConfig project.hasProperty('RHYTHMIX_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug`,
    );

    cfg.modResults.contents = gradle;
    return cfg;
  });

module.exports = withReleaseSigning;
