const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for macOS permission issues - use local cache directory instead of system temp
config.cacheStores = [
  new (require('metro-cache/src/stores/FileStore'))({
    root: path.join(__dirname, '.metro-cache')
  })
];

module.exports = config;
