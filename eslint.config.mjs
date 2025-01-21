// @ts-check
import shopifyEslintPlugin from '@shopify/eslint-plugin';

export default [
  {
    // global ignores need to be in their own block otherwise they don't seem to work
    ignores: [
      '.github/**',
      '.vscode/**',
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'playwright/**',
      'src/public/**',
      '**/*.config.{mjs,ts}'
    ],
  },
  ...shopifyEslintPlugin.configs.typescript,
  ...shopifyEslintPlugin.configs.prettier,
  {
    rules: {
      'line-comment-position': 'off',
      'no-warning-comments': 'warn',
      'no-process-env': 'warn',
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
        }
      ],
    }
  },
  {
    files: ['src/config/**/*.ts', 'tests/.jest/set-env-vars.ts'],
    rules: {
      'no-process-env': 'off',
    }
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      'no-console': 'off',
    }
  },
];
