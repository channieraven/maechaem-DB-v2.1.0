/// <reference types="jest" />

/**
 * Unit Test: useGrowthLogs Hook
 * Tests growth log data fetching with full denormalized data
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useGrowthLogs, useTreeGrowthLogs } from '../../hooks/useGrowthLogs';
import { DatabaseProvider } from '../../contexts/DatabaseContext';
import { createMockDatabaseService } from '../../lib/database/firestoreService.mock';

describe('useGrowthLogs', () => {
  const mockDb = createMockDatabaseService();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DatabaseProvider service={mockDb}>{children}</DatabaseProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useGrowthLogs hook', () => {
    it('should return empty array when plotId is not provided', () => {
      const { result } = renderHook(() => useGrowthLogs(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.logs).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should start with loading state when plotId is provided', () => {
      const { result } = renderHook(() => useGrowthLogs('plot-1'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.logs).toEqual([]);
    });

    it('should fetch growth logs successfully', async () => {
      const { result } = renderHook(() => useGrowthLogs('plot-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.logs).toBeDefined();
      expect(Array.isArray(result.current.logs)).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockDb.fetchGrowthLogsByPlot).toHaveBeenCalledWith('plot-1');
    });

    it('should return logs with tree and recorder details', async () => {
      const mockDbWithLogs = createMockDatabaseService({
        fetchGrowthLogsByPlot: jest.fn(async () => [
          {
            id: 'log-1',
            tree_id: 'tree-1',
            survey_date: '2024-01-15',
            survival_status: 'alive',
            recorder_id: 'user-1',
            tree_code: 'P01T001',
            tree_number: 1,
            species_code: 'A01',
            species_name_th: 'สักทอง',
            recorder_name: 'Test Recorder',
            created_at: new Date().toISOString(),
          } as any,
        ]),
      });

      const logWrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseProvider service={mockDbWithLogs}>{children}</DatabaseProvider>
      );

      const { result } = renderHook(() => useGrowthLogs('plot-1'), { wrapper: logWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const log = result.current.logs[0];
      if (log) {
        expect(log).toHaveProperty('id');
        expect(log).toHaveProperty('tree');
        expect(log).toHaveProperty('recorder');
        expect(log.tree).toHaveProperty('tree_code');
        expect(log.tree).toHaveProperty('species');
      }
    });

    it('should handle logs without recorder', async () => {
      const mockDbNoRecorder = createMockDatabaseService({
        fetchGrowthLogsByPlot: jest.fn(async () => [
          {
            id: 'log-1',
            tree_id: 'tree-1',
            survey_date: '2024-01-15',
            survival_status: 'alive',
            recorder_id: null,
            tree_code: 'P01T001',
            created_at: new Date().toISOString(),
          } as any,
        ]),
      });

      const noRecorderWrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseProvider service={mockDbNoRecorder}>{children}</DatabaseProvider>
      );

      const { result } = renderHook(() => useGrowthLogs('plot-1'), { wrapper: noRecorderWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const log = result.current.logs[0];
      expect(log.recorder).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      const mockDbWithError = createMockDatabaseService({
        fetchGrowthLogsByPlot: jest.fn(async () => {
          throw new Error('Database error');
        }),
      });

      const errorWrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseProvider service={mockDbWithError}>{children}</DatabaseProvider>
      );

      const { result } = renderHook(() => useGrowthLogs('plot-1'), { wrapper: errorWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.logs).toEqual([]);
    });

    it('should refetch when plotId changes', async () => {
      const { result, rerender } = renderHook(
        ({ plotId }) => useGrowthLogs(plotId),
        { wrapper, initialProps: { plotId: 'plot-1' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockDb.fetchGrowthLogsByPlot).toHaveBeenCalledWith('plot-1');

      rerender({ plotId: 'plot-2' });

      await waitFor(() => {
        expect(mockDb.fetchGrowthLogsByPlot).toHaveBeenCalledWith('plot-2');
      });
    });
  });

  describe('useTreeGrowthLogs hook', () => {
    it('should return empty array when treeId is not provided', () => {
      const { result } = renderHook(() => useTreeGrowthLogs(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.logs).toEqual([]);
    });

    it('should fetch tree growth logs successfully', async () => {
      const { result } = renderHook(() => useTreeGrowthLogs('tree-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.logs).toBeDefined();
      expect(mockDb.fetchGrowthLogsByTree).toHaveBeenCalledWith('tree-1');
    });

    it('should handle fetch errors for tree logs', async () => {
      const mockDbWithError = createMockDatabaseService({
        fetchGrowthLogsByTree: jest.fn(async () => {
          throw new Error('Tree not found');
        }),
      });

      const errorWrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseProvider service={mockDbWithError}>{children}</DatabaseProvider>
      );

      const { result } = renderHook(() => useTreeGrowthLogs('tree-1'), { wrapper: errorWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.logs).toEqual([]);
    });

    it('should handle logs with growth_dbh data', async () => {
      const mockDbWithDbh = createMockDatabaseService({
        fetchGrowthLogsByTree: jest.fn(async () => [
          {
            id: 'log-1',
            tree_id: 'tree-1',
            survey_date: '2024-01-15',
            survival_status: 'alive',
            tree_code: 'P01T001',
            dbh_data: {
              dbh_cm: 15.5,
              height_m: 8.2,
            },
            created_at: new Date().toISOString(),
          } as any,
        ]),
      });

      const dbhWrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseProvider service={mockDbWithDbh}>{children}</DatabaseProvider>
      );

      const { result } = renderHook(() => useTreeGrowthLogs('tree-1'), { wrapper: dbhWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const log = result.current.logs[0];
      expect(log).toHaveProperty('growth_dbh');
      expect(log.growth_dbh).toBeDefined();
    });
  });
});
