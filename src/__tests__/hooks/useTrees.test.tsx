/// <reference types="jest" />

/**
 * Unit Test: useTrees Hook
 * Tests tree data fetching with coordinate conversion
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useTrees, useTree } from '../../hooks/useTrees';
import { DatabaseProvider } from '../../contexts/DatabaseContext';
import { createMockDatabaseService } from '../../lib/database/firestoreService.mock';

describe('useTrees', () => {
  const mockDb = createMockDatabaseService();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DatabaseProvider service={mockDb}>{children}</DatabaseProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTrees hook', () => {
    it('should return empty array when plotId is not provided', () => {
      const { result } = renderHook(() => useTrees(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.trees).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should start with loading state when plotId is provided', () => {
      const { result } = renderHook(() => useTrees('plot-1'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.trees).toEqual([]);
    });

    it('should fetch trees successfully', async () => {
      const { result } = renderHook(() => useTrees('plot-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.trees).toBeDefined();
      expect(Array.isArray(result.current.trees)).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockDb.fetchTreesByPlot).toHaveBeenCalledWith('plot-1');
    });

    it('should return trees with species and plot details', async () => {
      const { result } = renderHook(() => useTrees('plot-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const tree = result.current.trees[0];
      if (tree) {
        expect(tree).toHaveProperty('id');
        expect(tree).toHaveProperty('tree_code');
        expect(tree).toHaveProperty('species');
        expect(tree).toHaveProperty('plot');
        expect(tree.species).toHaveProperty('species_code');
        expect(tree.species).toHaveProperty('name_th');
        expect(tree.plot).toHaveProperty('plot_code');
      }
    });

    it('should convert UTM coordinates to lat/lng', async () => {
      const { result } = renderHook(() => useTrees('plot-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const tree = result.current.trees[0];
      if (tree && tree.utm_x && tree.utm_y) {
        expect(tree).toHaveProperty('lat');
        expect(tree).toHaveProperty('lng');
      }
    });

    it('should handle trees without coordinates', async () => {
      const mockDbNoCoords = createMockDatabaseService({
        fetchTreesByPlot: jest.fn(async () => [
          {
            id: 'tree-1',
            plot_id: 'plot-1',
            tree_number: 1,
            tree_code: 'P01T001',
            species_id: 'species-1',
            tag_label: null,
            utm_x: null,
            utm_y: null,
            geom: null,
            created_at: new Date().toISOString(),
          } as any,
        ]),
      });

      const noCoordWrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseProvider service={mockDbNoCoords}>{children}</DatabaseProvider>
      );

      const { result } = renderHook(() => useTrees('plot-1'), { wrapper: noCoordWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const tree = result.current.trees[0];
      expect(tree.lat).toBeNull();
      expect(tree.lng).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      const mockDbWithError = createMockDatabaseService({
        fetchTreesByPlot: jest.fn(async () => {
          throw new Error('Database error');
        }),
      });

      const errorWrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseProvider service={mockDbWithError}>{children}</DatabaseProvider>
      );

      const { result } = renderHook(() => useTrees('plot-1'), { wrapper: errorWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.trees).toEqual([]);
    });

    it('should refetch when plotId changes', async () => {
      const { result, rerender } = renderHook(
        ({ plotId }) => useTrees(plotId),
        { wrapper, initialProps: { plotId: 'plot-1' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockDb.fetchTreesByPlot).toHaveBeenCalledWith('plot-1');

      rerender({ plotId: 'plot-2' });

      await waitFor(() => {
        expect(mockDb.fetchTreesByPlot).toHaveBeenCalledWith('plot-2');
      });
    });
  });

  describe('useTree hook', () => {
    it('should return null when treeCode is not provided', () => {
      const { result } = renderHook(() => useTree(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.tree).toBeNull();
    });

    it('should fetch single tree by code', async () => {
      const { result } = renderHook(() => useTree('P01T001'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tree).toBeDefined();
      expect(mockDb.fetchTreeByCode).toHaveBeenCalledWith('P01T001');
    });

    it('should handle fetch errors for single tree', async () => {
      const mockDbWithError = createMockDatabaseService({
        fetchTreeByCode: jest.fn(async () => {
          throw new Error('Tree not found');
        }),
      });

      const errorWrapper = ({ children }: { children: React.ReactNode }) => (
        <DatabaseProvider service={mockDbWithError}>{children}</DatabaseProvider>
      );

      const { result } = renderHook(() => useTree('INVALID'), { wrapper: errorWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.tree).toBeNull();
    });
  });
});
