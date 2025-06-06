module.exports = {
  env: {
    browser: true, // Penting untuk frontend
    node: true, // Untuk file konfigurasi dan skrip build
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    // 'plugin:react/recommended', // Jika pakai React
    // 'plugin:jsx-a11y/recommended', // Jika pakai React & peduli aksesibilitas
    // 'plugin:@typescript-eslint/recommended', // Jika pakai TypeScript
    // 'prettier', // Pastikan ini terakhir untuk menonaktifkan aturan ESLint yang konflik dengan Prettier
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Jika pakai JSX
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'jest',
    // 'react', // Jika pakai React
    // 'jsx-a11y', // Jika pakai React
    // '@typescript-eslint', // Jika pakai TypeScript
  ],
  settings: {
    // react: { version: 'detect' }, // Jika pakai React
  },
  rules: {
    // Aturan yang sudah ada sebelumnya bisa tetap digunakan
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    
    // Additional formatting rules to match your project
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'comma-dangle': ['error', 'all'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    
    // Allow console statements (for debugging)
    'no-console': 'off',
    
    // Allow unused variables (common in frontend)
    'no-unused-vars': 'warn',
    
    // Allow global variables
    'no-undef': 'off',

    // Aturan spesifik React jika perlu:
    // 'react/prop-types': 'off', // Bisa dimatikan jika pakai TypeScript atau tidak terlalu ketat
    // 'react/react-in-jsx-scope': 'off', // Tidak perlu di React 17+
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