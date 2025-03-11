// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  [
    {
      // global ignores need to be in their own block otherwise they don't seem to work
      ignores: [
        '.github/**',
        '.vscode/**',
        'coverage/**',
        'dist/**',
        'dist/**',
        'node_modules/**',
        'playwright/**',
        'src/public/**',
        '**/*.config.{mjs,ts}'
      ],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
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
      }
    },
    {
      files: ['src/config/**/*.ts', 'test/helpers/jest-setup.ts'],
      rules: {
        'no-process-env': 'off',
      }
    },
    {
      files: ['tests/**/*.ts', 'tests-e2e/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
);
