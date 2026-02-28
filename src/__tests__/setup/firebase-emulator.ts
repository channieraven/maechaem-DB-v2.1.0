/**
 * Firebase Emulator Setup and Configuration
 * For local testing with real Firebase services (optional)
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator,
  FirebaseStorage,
} from 'firebase/storage';

interface EmulatorConfig {
  enableAuth?: boolean;
  enableFirestore?: boolean;
  enableStorage?: boolean;
  authPort?: number;
  firestorePort?: number;
  storagePort?: number;
  host?: string;
}

/**
 * Initialize Firebase with emulators for testing
 *
 * Usage:
 * ```
 * const { auth, db, storage } = initializeFirebaseWithEmulators({
 *   enableAuth: true,
 *   enableFirestore: true,
 * });
 * ```
 *
 * Before running tests, start emulators:
 * ```
 * firebase emulators:start
 * ```
 */
export function initializeFirebaseWithEmulators(config: EmulatorConfig = {}) {
  const {
    enableAuth = true,
    enableFirestore = true,
    enableStorage = false,
    authPort = 9099,
    firestorePort = 8085,
    storagePort = 9199,
    host = 'localhost',
  } = config;

  const firebaseConfig = {
    projectId: 'test-project',
    apiKey: 'test-api-key',
    authDomain: `${host}:${authPort}`,
    storageBucket: 'test-bucket.appspot.com',
  };

  const app = initializeApp(firebaseConfig, 'test-app');

  let auth: Auth | null = null;
  let db: Firestore | null = null;
  let storage: FirebaseStorage | null = null;

  if (enableAuth) {
    auth = getAuth(app);
    try {
      connectAuthEmulator(auth, `http://${host}:${authPort}`, {
        disableWarnings: true,
      });
      console.log('✅ Connected to Auth Emulator');
    } catch (error) {
      console.warn('⚠️ Auth Emulator already connected or unavailable');
    }
  }

  if (enableFirestore) {
    db = getFirestore(app);
    try {
      connectFirestoreEmulator(db, host, firestorePort);
      console.log('✅ Connected to Firestore Emulator');
    } catch (error) {
      console.warn('⚠️ Firestore Emulator already connected or unavailable');
    }
  }

  if (enableStorage) {
    storage = getStorage(app);
    try {
      connectStorageEmulator(storage, host, storagePort);
      console.log('✅ Connected to Storage Emulator');
    } catch (error) {
      console.warn('⚠️ Storage Emulator already connected or unavailable');
    }
  }

  return { app, auth, db, storage };
}

/**
 * Cleanup function to reset emulator state between tests
 *
 * Usage:
 * ```
 * afterEach(async () => {
 *   await cleanupEmulator();
 * });
 * ```
 */
export async function cleanupEmulator() {
  try {
    // Note: Emulator cleanup requires special REST calls
    // This is a placeholder - actual cleanup depends on your setup
    console.log('Emulator state would be cleared between tests');
  } catch (error) {
    console.error('Error cleaning up emulator:', error);
  }
}

export { initializeApp } from 'firebase/app';
export { getAuth, connectAuthEmulator } from 'firebase/auth';
export { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
export { getStorage, connectStorageEmulator } from 'firebase/storage';
