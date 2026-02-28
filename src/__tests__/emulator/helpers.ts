/**
 * Emulator Test Helpers
 * Utilities for testing with Firebase Emulator
 */

import { initializeApp, FirebaseApp, deleteApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import { createFirestoreService, DatabaseService } from '../../lib/database/firestoreService';

// Emulator configuration
const EMULATOR_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8085;
const TEST_USER_ID = 'emulator-test-user';

// Test Firebase config
const testFirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'maechaem-db-rfd',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let dbService: DatabaseService | null = null;

/**
 * Initialize Firebase app with Firestore emulator
 */
export async function setupEmulator(): Promise<{
  app: FirebaseApp;
  db: Firestore;
  dbService: DatabaseService;
}> {
  process.env.FIRESTORE_EMULATOR_HOST = `${EMULATOR_HOST}:${FIRESTORE_PORT}`;
  process.env.GCLOUD_PROJECT = testFirebaseConfig.projectId;

  // Create unique app name for each test
  const appName = `test-app-${Date.now()}-${Math.random()}`;
  
  app = initializeApp(testFirebaseConfig, appName);
  db = getFirestore(app);

  // Connect to emulator
  try {
    connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_PORT, {
      mockUserToken: {
        sub: TEST_USER_ID,
        user_id: TEST_USER_ID,
        email: 'emulator@test.local',
        firebase: {
          sign_in_provider: 'custom',
        },
      },
    });
  } catch (error) {
    // Ignore if already connected
    if (!error.message?.includes('already been called')) {
      throw error;
    }
  }

  dbService = createFirestoreService(db);

  await setDoc(
    doc(db, 'profiles', TEST_USER_ID),
    {
      id: TEST_USER_ID,
      email: 'emulator@test.local',
      fullname: 'Emulator Test User',
      position: 'QA',
      organization: 'Automated Test',
      role: 'admin',
      approved: true,
      created_at: new Date().toISOString(),
    },
    { merge: true }
  );

  return { app, db, dbService };
}

/**
 * Clean up emulator data and app instance
 */
export async function teardownEmulator() {
  if (db) {
    await clearFirestoreData(db);
  }
  
  if (app) {
    await deleteApp(app);
  }

  app = null;
  db = null;
  dbService = null;
}

/**
 * Clear all data from Firestore emulator
 */
export async function clearFirestoreData(firestore: Firestore): Promise<void> {
  void firestore;

  await new Promise<void>((resolve, reject) => {
    try {
      const http = require('http');
      const req = http.request(
        {
          hostname: EMULATOR_HOST,
          port: FIRESTORE_PORT,
          path: `/emulator/v1/projects/${testFirebaseConfig.projectId}/databases/(default)/documents`,
          method: 'DELETE',
          timeout: 5000,
        },
        (res: { statusCode?: number }) => {
          const statusCode = res.statusCode ?? 0;
          if (statusCode >= 200 && statusCode < 300) {
            resolve();
            return;
          }
          reject(new Error(`Failed to clear emulator data. HTTP ${statusCode}`));
        }
      );

      req.on('error', (error: Error) => reject(error));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timed out clearing Firestore emulator data'));
      });
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Wait for async operations to complete
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if emulator is running
 */
export async function isEmulatorRunning(): Promise<boolean> {
  // Use node's http module instead of fetch
  return new Promise((resolve) => {
    try {
      const http = require('http');
      const req = http.request({
        hostname: EMULATOR_HOST,
        port: FIRESTORE_PORT,
        method: 'GET',
        timeout: 3000,
      }, (res: any) => {
        resolve(true);
      });
      req.on('error', () => {
        resolve(false);
      });
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch (error) {
      resolve(false);
    }
  });
}

/**
 * Generate random ID for testing
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create test data helpers
 */
export const testDataHelpers = {
  createTestProfile: (overrides = {}) => ({
    id: generateTestId('user'),
    email: `test-${Date.now()}@example.com`,
    fullname: 'Test User',
    position: 'Researcher',
    organization: 'Test Org',
    role: 'pending' as const,
    approved: false,
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  createTestPlot: (overrides = {}) => ({
    plot_code: `P${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
    name_short: `Plot ${Math.floor(Math.random() * 100)}`,
    owner_name: 'Test Owner',
    group_number: 1,
    area_sq_m: 5000,
    tambon: 'Test Tambon',
    elevation_m: 500,
    boundary_geojson: null,
    note: null,
    ...overrides,
  }),

  createTestTree: (plotId: string, overrides = {}) => ({
    plot_id: plotId,
    tree_number: Math.floor(Math.random() * 1000) + 1,
    tree_code: `P01T${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    species_id: 'species-test',
    tag_label: null,
    row_main: '1',
    row_sub: '1',
    utm_x: 500000 + Math.random() * 1000,
    utm_y: 1234567 + Math.random() * 1000,
    geom: null,
    grid_spacing: null,
    note: null,
    ...overrides,
  }),

  createTestGrowthLog: (treeId: string, overrides = {}) => ({
    tree_id: treeId,
    survey_date: new Date().toISOString().split('T')[0],
    recorder_id: generateTestId('user'),
    survival_status: 'alive' as const,
    note: null,
    ...overrides,
  }),

  createTestSpecies: (overrides = {}) => ({
    species_code: `A${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
    species_group: 'A',
    group_label: 'ไม้ป่า',
    plant_category: 'forest' as const,
    name_th: 'ต้นไม้ทดสอบ',
    name_en: 'Test Tree',
    name_sci: 'Testus testicus',
    hex_color: '2d5a27',
    ...overrides,
  }),
};
