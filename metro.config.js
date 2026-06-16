const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, '../react-native-vosk-asr');
const projectNodeModules = path.resolve(projectRoot, 'node_modules');
const libraryNodeModules = path.resolve(libraryRoot, 'node_modules');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [libraryRoot],
  resolver: {
    unstable_enableSymlinks: true,
    nodeModulesPaths: [projectNodeModules, libraryNodeModules],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
