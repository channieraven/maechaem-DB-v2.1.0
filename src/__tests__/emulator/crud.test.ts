/// <reference types="jest" />

/**
 * Smoke CRUD Test Suite (Minimal)
 * 1 flow per resource เพื่อลด timeout และหา root cause เร็วขึ้น
 *
 * Prerequisites:
 * - Start Firebase emulator: firebase emulators:start
 * - Firestore Emulator must be running on localhost:8085
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  setupEmulator,
  teardownEmulator,
  clearFirestoreData,
  testDataHelpers,
  generateTestId,
} from './helpers';
import type { DatabaseService } from '../../lib/database/firestoreService';
import type { Firestore } from 'firebase/firestore';

describe('Smoke CRUD Tests (Minimal)', () => {
  let db: Firestore;
  let dbService: DatabaseService;

  beforeAll(async () => {
    try {
      const setup = await setupEmulator();
      db = setup.db;
      dbService = setup.dbService;
      console.log('✅ Connected to Firebase Emulator');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Firebase Emulator is not available. Start it with: firebase emulators:start. Details: ${message}`
      );
    }
  });

  afterAll(async () => {
    await teardownEmulator();
  });

  beforeEach(async () => {
    if (db) {
      await clearFirestoreData(db);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE Flow: Create → Read
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Profile: Create → Read', () => {
    it('should create and read profile', async () => {
      const userId = generateTestId('user');
      const email = `smoke-${Date.now()}@example.com`;

      // CREATE
      const result = await dbService.createProfile(userId, email, 'Smoke Test User');
      expect(result.profile.id).toBe(userId);
      expect(result.profile.email).toBe(email);

      // READ
      const profile = await dbService.fetchProfile(userId);
      expect(profile).toBeDefined();
      expect(profile?.id).toBe(userId);
      expect(profile?.email).toBe(email);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PLOT Flow: Create → Read → Update → Delete
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Plot: Create → Read → Update → Delete', () => {
    it('should create, read, update and delete plot', async () => {
      const plotData = testDataHelpers.createTestPlot();

      // CREATE
      const plotId = await dbService.createPlot(plotData);
      expect(plotId).toBeDefined();

      // READ
      let plot = await dbService.fetchPlot(plotId);
      expect(plot?.id).toBe(plotId);
      expect(plot?.plot_code).toBe(plotData.plot_code);

      // UPDATE
      await dbService.updatePlot(plotId, { name_short: 'Updated Plot' });
      plot = await dbService.fetchPlot(plotId);
      expect(plot?.name_short).toBe('Updated Plot');

      // DELETE
      await dbService.deletePlot(plotId);
      plot = await dbService.fetchPlot(plotId);
      expect(plot).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TREE Flow: Create → Read → Delete
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tree: Create → Read → Delete', () => {
    it('should create, read and delete tree', async () => {
      const plotData = testDataHelpers.createTestPlot();
      const plotId = await dbService.createPlot(plotData);

      const treeData = testDataHelpers.createTestTree(plotId);

      // CREATE
      const treeId = await dbService.createTree(treeData);
      expect(treeId).toBeDefined();

      // READ
      let tree = await dbService.fetchTreeByCode(treeData.tree_code);
      expect(tree?.id).toBe(treeId);
      expect(tree?.plot_id).toBe(plotId);

      // DELETE
      await dbService.deleteTree(treeId);
      tree = await dbService.fetchTreeByCode(treeData.tree_code);
      expect(tree).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GROWTH LOG Flow: Create → Read → Delete
  // ═══════════════════════════════════════════════════════════════════════════

  describe('GrowthLog: Create → Read → Delete', () => {
    it('should create, read and delete growth log', async () => {
      const plotData = testDataHelpers.createTestPlot();
      const plotId = await dbService.createPlot(plotData);

      const treeData = testDataHelpers.createTestTree(plotId);
      const treeId = await dbService.createTree(treeData);

      const growthLogData = testDataHelpers.createTestGrowthLog(treeId);

      // CREATE
      const logId = await dbService.createGrowthLog(growthLogData);
      expect(logId).toBeDefined();

      // READ
      let logs = await dbService.fetchGrowthLogsByTree(treeId);
      expect(logs.length).toBe(1);
      expect(logs[0].id).toBe(logId);

      // DELETE
      await dbService.deleteGrowthLog(logId);
      logs = await dbService.fetchGrowthLogsByTree(treeId);
      expect(logs.length).toBe(0);
    });
  });
});
