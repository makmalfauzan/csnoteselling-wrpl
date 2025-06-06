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
    'prettier', // Add this to disable ESLint rules that conflict with Prettier
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
    'prettier', // Add prettier plugin
  ],
  rules: {
    // Prettier rule
    'prettier/prettier': 'error',

    // Disabled rules that often cause issues
    'linebreak-style': 'off', // Windows compatibility
    'no-console': 'off', // Allow console statements
    'no-unused-vars': 'warn', // Warning instead of error
    'no-undef': 'off', // Allow global variables

    // Remove formatting rules - let Prettier handle them
    // indent: ['error', 2], // Remove - Prettier handles this
    // quotes: ['error', 'single'], // Remove - Prettier handles this
    // semi: ['error', 'always'], // Remove - Prettier handles this

    // Remove these as well - Prettier handles formatting
    // 'comma-dangle': 'off',
    // 'object-curly-spacing': 'off',
    // 'array-bracket-spacing': 'off',
    // 'space-before-blocks': 'off',
    // 'keyword-spacing': 'off',
    // 'space-infix-ops': 'off',
    // 'no-multiple-empty-lines': 'off',
    // 'no-trailing-spaces': 'off',
    // 'eol-last': 'off',
  },
  globals: {
    // Browser globals
    document: 'readonly',
    window: 'readonly',
    localStorage: 'readonly',
    alert: 'readonly',
    fetch: 'readonly',
    console: 'readonly',

    // Your custom functions
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
