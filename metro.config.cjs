// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

// ✅ Add SVG support properly
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// ❌ FIX 1: destructure these *after* config is created
const { assetExts, sourceExts } = config.resolver;

// ❌ FIX 2: use `.push('svg')`, not `.push['svg']`
config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

// ✅ Wrap with Reanimated config and export
module.exports = wrapWithReanimatedMetroConfig(config);
