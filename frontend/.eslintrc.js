module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'jest',
  ],
  rules: {
    // Basic formatting rules
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Additional formatting rules
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    
    // Relaxed rules for development
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
  },
  globals: {
    // Browser globals
    document: 'readonly',
    window: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    alert: 'readonly',
    fetch: 'readonly',
    console: 'readonly',
    
    // Custom functions - only include if they're actually used
    loadRecommended: 'readonly',
    loadWalletBalance: 'readonly',
    updateQuickStats: 'readonly',
    updateWishlistCount: 'readonly',
    formatCurrency: 'readonly',
    formatCurrencyy: 'readonly',
    fetchBuyerOrders: 'readonly',
    renderOrdersTable: 'readonly',
    updatePaginationButtons: 'readonly',
  },
};