/// <reference types="jest" />

/**
 * Mock for Firebase Configuration
 * Prevents import.meta.env errors in Jest
 */

// Mock Firestore
export const db = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
} as any;

// Mock Firebase App
export const app = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'mock-api-key',
    authDomain: 'mock-domain.firebaseapp.com',
    projectId: 'mock-project',
  },
} as any;

// Mock Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
} as any;

export default app;
