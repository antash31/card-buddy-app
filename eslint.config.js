// #genai: Flat ESLint config for Expo + Prettier interop.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'android/**', 'ios/**'],
  },
  {
    // Teaches eslint-plugin-import about the `@/` aliases declared in jsconfig.json.
    settings: {
      'import/resolver': {
        typescript: { project: './jsconfig.json' },
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]);
