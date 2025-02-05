import jslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import perfectionist from 'eslint-plugin-perfectionist'
import tslint from 'typescript-eslint'

export default tslint.config(
  jslint.configs.all,
  ...tslint.configs.all,
  stylistic.configs['recommended-flat'],
  {
    files: [
      '{benchmark,src,test}/**/*.ts',
      'examples/**/*.js',
      '*.{mjs,ts}',
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      perfectionist,
    },
    rules: {
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/indent': ['error', 2, {
        ArrayExpression: 1,
        CallExpression: { arguments: 1 },
        flatTernaryExpressions: false,
        FunctionDeclaration: { body: 1, parameters: 1 },
        FunctionExpression: { body: 1, parameters: 1 },
        ignoreComments: false,
        ignoredNodes: [
          'TemplateLiteral *',
          'TSUnionType',
          'TSIntersectionType',
          'TSTypeParameterInstantiation',
          'FunctionExpression > .params[decorators.length > 0]',
          'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
        ],
        ImportDeclaration: 1,
        MemberExpression: 1,
        ObjectExpression: 1,
        offsetTernaryExpressions: true,
        outerIIFEBody: 1,
        SwitchCase: 1,
        VariableDeclarator: 1,
      }],
      '@stylistic/operator-linebreak': ['error', 'after', {
        overrides: {
          ':': 'before',
          '?': 'before',
        },
      }],
      '@stylistic/padding-line-between-statements': ['error', {
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
      }],
      '@stylistic/quotes': ['error', 'single'],
      '@typescript-eslint/array-type': ['error', {
        default: 'array-simple',
      }],
      '@typescript-eslint/class-methods-use-this': 'off',
      '@typescript-eslint/consistent-return': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', {
        fixStyle: 'inline-type-imports',
      }],
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-extraneous-class': ['error', {
        allowStaticOnly: true,
      }],
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-misused-spread': 'off',
      '@typescript-eslint/no-unnecessary-condition': ['error', {
        allowConstantLoopConditions: true,
      }],
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        caughtErrors: 'none',
      }],
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', {
        allowAny: false,
        allowBoolean: false,
        allowNever: false,
        allowNullish: false,
        allowRegExp: false,
      }],
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      '@typescript-eslint/unbound-method': ['error', {
        ignoreStatic: true,
      }],
      'arrow-body-style': 'off',
      'camelcase': 'off',
      'capitalized-comments': 'off',
      'complexity': 'off',
      'func-style': 'off',
      'id-length': 'off',
      'max-classes-per-file': 'off',
      'max-depth': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-await-in-loop': 'off',
      'no-bitwise': 'off',
      'no-console': ['error', {
        allow: [
          'error',
          'table',
        ],
      }],
      'no-nested-ternary': 'off',
      'no-ternary': 'off',
      'no-undef-init': 'off',
      'no-undefined': 'off',
      'no-useless-assignment': 'off',
      'no-void': ['error', {
        allowAsStatement: true,
      }],
      'object-shorthand': ['error'],
      'one-var': 'off',
      'perfectionist/sort-classes': ['error', {
        groups: [
          'index-signature',
          'static-property',
          'static-method',
          [
            'property',
            'accessor-property',
          ],
          [
            'protected-property',
            'protected-accessor-property',
          ],
          [
            'private-property',
            'private-accessor-property',
          ],
          [
            'get-method',
            'set-method',
          ],
          'constructor',
          'method',
          'protected-method',
          'private-method',
          'unknown',
        ],
      }],
      'perfectionist/sort-enums': ['error'],
      'perfectionist/sort-exports': ['error'],
      'perfectionist/sort-imports': ['error', {
        newlinesBetween: 'never',
      }],
      'perfectionist/sort-interfaces': ['error'],
      'perfectionist/sort-intersection-types': ['error'],
      'perfectionist/sort-named-exports': ['error'],
      'perfectionist/sort-named-imports': ['error'],
      'perfectionist/sort-object-types': ['error'],
      'perfectionist/sort-objects': ['error'],
      'perfectionist/sort-switch-case': ['error'],
      'perfectionist/sort-union-types': ['error'],
      'prefer-const': ['error', {
        destructuring: 'all',
      }],
      'require-atomic-updates': 'off',
      'sort-imports': 'off',
      'sort-keys': 'off',
    },
  },
  {
    files: [
      'test/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: [
      'examples/**/*.js',
      '*.mjs',
    ],
    ...tslint.configs.disableTypeChecked,
  },
  {
    files: [
      'examples/**/*.js',
      '*.mjs',
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
)
