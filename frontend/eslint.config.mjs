import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { languageOptions: { globals: globals.node } },
  {
    ignores: ['docs/', 'dist/', 'node_modules/', '*.js']
  },
  eslintConfigPrettier,
  ...tseslint.configs.recommended
];
