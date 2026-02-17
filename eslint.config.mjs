import eslint from '@eslint/js'
import html from '@html-eslint/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import perfectionist from 'eslint-plugin-perfectionist'
import { defineConfig } from 'eslint/config'
import tslint from 'typescript-eslint'

export default defineConfig(
  {
    extends: [
      eslint.configs.recommended,
      tslint.configs.strictTypeChecked,
      stylistic.configs.recommended,
      perfectionist.configs['recommended-alphabetical'],
    ],
    files: [
      'src/**/*.ts',
      'test/**/*.ts',
      '*.ts',
      '*.mjs',
    ],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
      },
    },
    rules: {
      '@stylistic/array-bracket-newline': [
        'error',
        {
          multiline: true,
        },
      ],
      '@stylistic/array-element-newline': [
        'error',
        {
          ArrayExpression: {
            minItems: 1,
            multiline: true,
          },
          ArrayPattern: {
            minItems: 2,
            multiline: true,
          },
        },
      ],
      '@stylistic/arrow-parens': [
        'error',
        'always',
      ],
      '@stylistic/brace-style': [
        'error',
        '1tbs',
      ],
      '@stylistic/object-curly-newline': [
        'error',
        {
          ObjectExpression: {
            minProperties: 1,
            multiline: true,
          },
          ObjectPattern: {
            consistent: true,
            minProperties: 2,
            multiline: true,
          },
          TSInterfaceBody: {
            minProperties: 1,
            multiline: true,
          },
        },
      ],
      '@stylistic/object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: false,
        },
      ],
      '@stylistic/operator-linebreak': [
        'error',
        'after',
        {
          overrides: {
            ':': 'before',
            '?': 'before',
          },
        },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          next: 'block-like',
          prev: '*',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: 'block-like',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: [
            'const',
            'expression',
            'let',
          ],
        },
        {
          blankLine: 'never',
          next: [
            'const',
            'let',
          ],
          prev: 'const',
        },
        {
          blankLine: 'never',
          next: [
            'const',
            'let',
          ],
          prev: 'let',
        },
        {
          blankLine: 'never',
          next: 'expression',
          prev: 'expression',
        },
        {
          blankLine: 'never',
          next: [
            'break',
            'throw',
          ],
          prev: [
            'const',
            'expression',
            'let',
          ],
        },
        {
          blankLine: 'always',
          next: 'import',
          prev: '*',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: 'import',
        },
        {
          blankLine: 'never',
          next: 'import',
          prev: 'import',
        },
        {
          blankLine: 'always',
          next: [
            'multiline-const',
            'multiline-expression',
            'multiline-let',
          ],
          prev: '*',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: [
            'multiline-const',
            'multiline-expression',
            'multiline-let',
          ],
        },
      ],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array-simple',
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreVoidReturningFunctions: true,
        },
      ],
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-invalid-void-type': [
        'error',
        {
          allowAsThisParameter: true,
        },
      ],
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],
      '@typescript-eslint/unbound-method': [
        'error',
        {
          ignoreStatic: true,
        },
      ],
      'func-style': [
        'error',
        'declaration',
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          newlinesBetween: 'never',
        },
      ],
      'require-atomic-updates': [
        'error',
        {
          allowProperties: true,
        },
      ],
      'sort-imports': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      // node:test lifecycle functions (describe, it, before, after, beforeEach) return
      // promises that are managed by the test runner — not by user code.
      '@typescript-eslint/no-floating-promises': 'off',
      // Test code routinely asserts on mock data, where non-null assertions and
      // untyped access are pragmatic and safe.
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      // Allow _-prefixed parameters in test helpers (e.g. mock method signatures
      // that must match an interface but don't use every argument).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
    },
  },
  {
    extends: [tslint.configs.disableTypeChecked],
    files: ['*.mjs'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    extends: [html.configs.recommended],
    files: ['src/**/*.html'],
    language: 'html/html',
    rules: {
      'html/attrs-newline': [
        'error',
        {
          ifAttrsMoreThan: 4,
        },
      ],
      'html/indent': [
        'error',
        2,
      ],
      'html/lowercase': ['error'],
      'html/no-extra-spacing-text': ['error'],
      'html/no-multiple-empty-lines': [
        'error',
        {
          max: 1,
        },
      ],
      'html/sort-attrs': ['error'],
      'html/use-baseline': [
        'error',
        {
          available: 'newly',
        },
      ],
    },
  },
)
