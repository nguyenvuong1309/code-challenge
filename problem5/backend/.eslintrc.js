module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
    'import',
    'node'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:node/recommended',
    'plugin:prettier/recommended', // Must be last
  ],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      typescript: true
    },
  },
  rules: {
    // Only override when absolutely necessary - most rules come from strict-type-checked
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_', 
      varsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_'
    }],
    // Allow console in development but warn
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    // These should be enabled for type safety - will fix code instead of disabling
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
          arguments: false
        }
      }
    ],
    
    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',   // Built-in imports (come from NodeJS native) go first
          'external',  // <- External imports
          'internal',  // <- Absolute imports & other imports
          'parent',    // <- Relative imports, the sibling and parent types they can be mingled together
          'sibling',
          'index',     // <- index imports
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-unused-modules': 'warn',
    
    // Node.js specific rules
    'node/no-missing-import': 'off', // TypeScript handles this
    'node/no-unsupported-features/es-syntax': 'off', // We use TypeScript
    'node/no-missing-require': 'off', // We use ES modules
    'node/shebang': 'off',
    
    // Most code quality rules are covered by strict-type-checked
    // Only add specific overrides if needed
    'no-process-exit': 'off', // Allow process.exit in main files
    
    // Prettier integration
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      // Disable some rules for test files
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        // Relax some rules for test files only when absolutely necessary
        'no-console': 'off',
        '@typescript-eslint/unbound-method': 'off', // jest.fn() causes this
        '@typescript-eslint/no-unsafe-assignment': 'off', // test mocks
      },
    },
    {
      // Configuration files
      files: ['.eslintrc.js', '*.config.js'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'logs/',
    '*.js.map',
    '.env*',
    'docker-compose.yml',
    'Dockerfile',
  ],
};