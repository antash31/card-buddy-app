const { withAndroidManifest } = require('expo/config-plugins');
module.exports = function withSmsTracking(config) {
  return withAndroidManifest(config, (config) => {
    // Encrypted outbox and auth grants are device-bound and must never be backed up.
    const application = config.modResults.manifest.application?.[0];
    if (application) application.$['android:allowBackup'] = 'false';
    return config;
  });
};
