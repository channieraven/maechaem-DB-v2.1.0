/// <reference types="jest" />

import { createMockDatabaseService } from '../../lib/database/firestoreService.mock';

/**
 * Mock Database Context Provider for testing.
 * Returns a full DatabaseService mock aligned with the interface.
 */
export const createMockDatabaseContext = () => createMockDatabaseService();

/**
 * Mock Offline Context Provider for testing
 */
export const createMockOfflineContext = () => ({
  isOnline: true,
  syncStatus: 'idle' as const,
  pendingCount: 0,
  syncNow: jest.fn(),
});
