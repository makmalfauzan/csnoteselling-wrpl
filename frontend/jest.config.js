module.exports = {
  // Untuk frontend (misal React dengan Create React App atau Next.js), seringkali ada preset:
  // preset: 'next/jest', // Jika menggunakan Next.js
  // Untuk setup manual:
  testEnvironment: 'jsdom', // Lingkungan tes untuk browser-like environment
  testMatch: ['**/tests/**/*.test.(js|jsx|ts|tsx)'], // Pola file tes
  moduleNameMapper: {
    // Jika menggunakan alias path di frontend
    '^@/(.*)$': '<rootDir>/src/$1', // Contoh alias untuk src/
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // File setup setelah environment
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}', // Cakupan dari file di src
    '!src/**/*.d.ts',
    '!src/main.{js,jsx,ts,tsx}', // Atau file entry point utama
    '!src/App.{js,jsx,ts,tsx}', // Atau file App utama
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // coverageThreshold: { ... }, // Bisa ditambahkan jika perlu
  verbose: true,
  transform: {
    // Diperlukan jika menggunakan JSX, TypeScript, atau fitur JS modern
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }], // Contoh untuk Next.js
    // Atau jika tidak pakai Next.js, mungkin perlu @babel/preset-env, @babel/preset-react, @babel/preset-typescript
  },
  // Jika kamu pakai Testing Library (umum untuk React/Vue/dll)
  // moduleFileExtensions: ['js', 'jsx', 'json', 'node'] // Sesuaikan
};
