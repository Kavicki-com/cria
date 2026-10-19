// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // Unused locals/parameters are already enforced by `tsc --noEmit`
    // (noUnusedLocals / noUnusedParameters), which understands the `_` prefix.
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'android/*', 'ios/*', 'expo-env.d.ts'],
  },
]);
