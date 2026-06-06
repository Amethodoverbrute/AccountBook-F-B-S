import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', '*.log'],
  },
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    plugins: { js },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    extends: [eslintConfigPrettier],
  },
  {
    files: ['**/*.vue'],
    extends: [pluginVue.configs['flat/essential']],
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
]);
