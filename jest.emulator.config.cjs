/**
 * Jest Configuration for Emulator Tests
 * Uses real Firebase SDK (no mocks)
 */

module.exports = {
  // Use node environment for Firestore emulator / gRPC internals
  testEnvironment: 'node',

  // NO SETUP FILES - we don't want the Firebase mocks
  setupFilesAfterEnv: [],

  // Module paths (no Firebase mocking)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
    '^../firebase$': '<rootDir>/src/__mocks__/firebase.ts',
    '^../../lib/firebase$': '<rootDir>/src/__mocks__/firebase.ts',
  },

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        types: ['jest'],
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Test file patterns - only emulator tests
  testMatch: [
    '<rootDir>/src/__tests__/emulator/**/*.test.ts',
  ],

  // Module file extensions
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],

  // Timeout - emulator tests may take longer
  testTimeout: 30000,

  // Verbose output
  verbose: true,
};
