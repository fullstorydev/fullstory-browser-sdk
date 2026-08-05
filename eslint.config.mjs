import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },
    },
    plugins: {
      'import-x': importX,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-underscore-dangle': 'off',
      'no-console': 'off',
      'max-len': ['error', { code: 125, ignoreComments: true }],
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['**/*.test.ts', '**/*.config.mjs', 'eslint.config.mjs'] },
      ],
      'import-x/no-unresolved': 'off',
    },
  },
);
