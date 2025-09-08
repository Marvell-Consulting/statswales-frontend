// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

const config = defineConfig([
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    // global ignores need to be in their own block otherwise they don't seem to work
    ignores: [
      '.github/**',
      '.vscode/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'playwright/**',
      'src/shared/public/**',
      '**/*.config.{mjs,ts}'
    ]
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  reactPlugin.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-console': 'error',
      'line-comment-position': 'off',
      'no-warning-comments': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
          leadingUnderscore: 'allow'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      'import/no-deprecated': 'warn',
      'import/no-empty-named-blocks': 'error',
      'import/no-extraneous-dependencies': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-unused-modules': 'error',
      'import/enforce-node-protocol-usage': ['error', 'always'],
      'import/no-unresolved': ['error', { ignore: ['csv-parse/sync', 'csv-stringify/sync'] }]
    }
  },
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      '@typescript-eslint/naming-convention': 'off'
    }
  },
  {
    files: ['**/*.jsx'],
    rules: {
      'react/prop-types': 'off'
    }
  },
  {
    files: ['src/config/**/*.ts', 'test/helpers/jest-setup.ts'],
    rules: {
      'no-process-env': 'off'
    }
  },
  {
    files: ['tests/**/*.ts', 'tests-e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]);

// console.log(config);

export default config;
