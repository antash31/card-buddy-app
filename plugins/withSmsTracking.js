const { withAndroidManifest } = require('expo/config-plugins');
module.exports = function withSmsTracking(config) {
  return withAndroidManifest(config, (config) => {
    // Encrypted outbox and auth grants are device-bound and must never be backed up.
    const application = config.modResults.manifest.application?.[0];
    // #genai — release APKs block plain HTTP unless this is set; the local API is http://
    if (application) {
      application.$['android:allowBackup'] = 'false';
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return config;
  });
};
