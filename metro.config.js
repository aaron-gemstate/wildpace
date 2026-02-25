const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix Firebase Auth "Component auth has not been registered yet" on Expo/React Native.
// Metro's package.json exports can load both CJS and ESM versions of firebase/auth;
// disabling this forces a single resolution so the auth component registers correctly.
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_enableSymlinks = false;

module.exports = config;
