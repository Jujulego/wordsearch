import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    '.idea/**',
    '.next/**',
    '.yarn/**',
    'out/**',
    'build/**',
    'lib/prisma/**',
    'next-env.d.ts',
  ]),
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  nextVitals,
  nextTs,
  prettier,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          enableAutofixRemoval: {
            imports: true,
          },
        },
      ],
    },
  },
]);
