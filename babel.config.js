module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo', // If you're using Expo
      'module:metro-react-native-babel-preset',
    ],
    plugins: [
      'react-native-reanimated/plugin', // Add this as the last plugin
    ],
  };
};
