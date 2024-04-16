module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      impliedStrict: true,
    },
    ecmaVersion: 2022,
    sourceType: 'module',
    // project: ['tsconfig.base.json'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  plugins: ['@typescript-eslint', 'import', 'react', 'react-hooks'],
  // ESLint extends configurations recursively
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  // ignorePatterns: ['src/test/*'],
  // 自定义规则，可以覆盖掉extends的配置, 0-off, 1-warn, 2-error
  rules: {
    // 'no-inline-comments':2,
    // 'multiline-comment-style': ["error", 'starred-block'],
    'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
    'no-param-reassign': 1,
    'no-invalid-this': 0,
    'no-unused-vars': 0,
    'no-var': 1,
    'no-empty': 1,
    'no-return-assign': 1,
    'no-inner-declarations': 1,
    'no-promise-executor-return': 0,
    'no-eq-null': 1,
    'no-sparse-arrays': 1,
    'no-new-object': 1,
    'no-implicit-coercion': 1,
    'no-useless-concat': 0,
    'no-labels': 1,
    'no-cond-assign': 1,
    'no-constant-condition': 1,
    'no-prototype-builtins': 1,
    'no-case-declarations': 1,
    'no-dupe-keys': 1,
    'no-redeclare': 1,
    'no-unreachable': 1,
    'no-useless-escape': 1,
    'no-multi-assign': 1,
    'no-self-assign': 1,
    eqeqeq: 1,
    'one-var': [2, 'never'],
    'guard-for-in': 1,
    'getter-return': 1,
    complexity: 0,
    'prefer-const': 1,
    'prefer-spread': 1,
    'prefer-rest-params': 1,
    'prefer-object-spread': 1,
    'prefer-arrow-callback': 0,
    'prefer-promise-reject-errors': 1,
    'prefer-object-has-own': 1,
    'prefer-regex-literals': 0,
    radix: 1,
    semi: 0,
    'max-nested-callbacks': 1,
    'max-params': ['warn', 5],
    'max-depth': ['warn', 5],
    'accessor-pairs': 0,
    'import/order': 0,
    'import/no-duplicates': 1,
    'node/no-unsupported-features/es-syntax': 0,
    'node/no-unpublished-import': [
      'warn',
      {
        allowModules: ['chai'],
      },
    ],
    'node/no-unpublished-require': [
      'warn',
      {
        allowModules: ['chai'],
      },
    ],
    'node/no-extraneous-require': 0,
    'node/no-extraneous-import': 0,
    'node/no-missing-import': 0,
    'node/no-unsupported-features/node-builtins': 0,
    'node/no-unsupported-features/es-builtins': 0,
    'no-process-exit': 1,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-invalid-this': 0,
    '@typescript-eslint/no-var-requires': 1,
    '@typescript-eslint/no-require-imports': 1,
    '@typescript-eslint/no-invalid-void-type': 1,
    '@typescript-eslint/no-this-alias': 1,
    '@typescript-eslint/no-unused-expressions': 1,
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/no-namespace': 1,
    '@typescript-eslint/no-non-null-asserted-optional-chain': 1,
    '@typescript-eslint/no-unnecessary-type-constraint': 1,
    // '@typescript-eslint/no-floating-promises': 2,
    // '@typescript-eslint/no-misused-promises': 2,
    // '@typescript-eslint/await-thenable': 2,
    '@typescript-eslint/parameter-properties': 1,
    '@typescript-eslint/ban-types': 1,
    '@typescript-eslint/ban-ts-comment': 1,
    '@typescript-eslint/prefer-for-of': 0,
    '@typescript-eslint/prefer-optional-chain': 0,
    '@typescript-eslint/prefer-function-type': 0,
    '@typescript-eslint/consistent-type-assertions': 0,
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/method-signature-style': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/member-ordering': 0,
    '@typescript-eslint/semi': 0,
    '@typescript-eslint/consistent-type-definitions': 0,
    '@typescript-eslint/class-literal-property-style': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/triple-slash-reference': 1,
    'react/no-find-dom-node': 1,
    'react/no-deprecated': 1,
    'react/no-did-update-set-state': 1,
    'react/no-unescaped-entities': 1,
    'react/no-unknown-property': 1,
    'react/jsx-no-constructed-context-values': 1,
    'react/prop-types': 0,
    'react/display-name': 0,
    'react/prefer-es6-class': 0,
    'react/sort-comp': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-no-useless-fragment': 1,
    'react/jsx-key': 1,
    'react/jsx-uses-react': 0,
    'react/jsx-fragments': 0,
    'react/jsx-curly-brace-presence': 1,
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 1,
    'react/self-closing-comp': 1,
    'react/no-children-prop': 1,
  },
};
