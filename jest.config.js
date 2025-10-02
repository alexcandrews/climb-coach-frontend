module.exports = {
  preset: 'jest-expo',
  // Fix for permission denied errors on macOS
  cacheDirectory: './.jest-cache',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!lib/api/generated/**',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ]
};
