// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'android/*', 'ios/*', 'supabase/*', 'expo-env.d.ts'],
  },
  {
    files: ['*.config.js', 'babel.config.js', 'metro.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', 'jest.setup*.js', '__mocks__/**'],
    languageOptions: { globals: globals.jest },
  },
]);
