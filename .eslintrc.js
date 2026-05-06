module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
};
