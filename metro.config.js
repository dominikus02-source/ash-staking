// metro.config.js
// Fix: mencegah Metro bundler mencoba resolve native-only modules
// saat build untuk web target (Expo web / expo-router web).

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Daftar package yang native-only dan harus di-exclude dari web bundling
const nativeOnlyModules = [
  'react-native-google-mobile-ads',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && nativeOnlyModules.includes(moduleName)) {
    // Return empty module untuk web platform
    return {
      type: 'empty',
    };
  }
  // Default resolution untuk semua platform lain
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
