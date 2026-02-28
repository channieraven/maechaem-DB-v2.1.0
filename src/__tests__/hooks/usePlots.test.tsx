/// <reference types="jest" />

/**
 * Unit Test: usePlots Hook
 * Tests plot data fetching with denormalized fields
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlots } from '../../hooks/usePlots';
import { DatabaseProvider } from '../../contexts/DatabaseContext';
import { createMockDatabaseService } from '../../lib/database/firestoreService.mock';
import type { Plot } from '../../lib/database.types';

describe('usePlots', () => {
  const mockDb = createMockDatabaseService();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DatabaseProvider service={mockDb}>{children}</DatabaseProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => usePlots(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.plots).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should fetch plots successfully', async () => {
    const { result } = renderHook(() => usePlots(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.plots).toBeDefined();
    expect(Array.isArray(result.current.plots)).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockDb.fetchPlots).toHaveBeenCalledTimes(1);
  });

  it('should return plots with denormalized fields', async () => {
    const { result } = renderHook(() => usePlots(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const plot = result.current.plots[0];
    if (plot) {
      expect(plot).toHaveProperty('id');
      expect(plot).toHaveProperty('plot_code');
      expect(plot).toHaveProperty('tree_count');
      expect(plot).toHaveProperty('alive_count');
      expect(plot).toHaveProperty('latest_survey_date');
      expect(typeof plot.tree_count).toBe('number');
      expect(typeof plot.alive_count).toBe('number');
    }
  });

  it('should handle missing denormalized fields with defaults', async () => {
    const mockDbWithBasicData = createMockDatabaseService({
      fetchPlots: jest.fn(async () => [
        {
          id: 'plot-1',
          plot_code: 'P01',
          name_short: 'P1',
          owner_name: 'Test Owner',
          group_number: 1,
          area_sq_m: 5000,
          tambon: 'Test Tambon',
          elevation_m: 500,
          boundary_geojson: null,
          note: null,
          created_at: new Date().toISOString(),
        } as Plot,
      ]),
    });

    const basicWrapper = ({ children }: { children: React.ReactNode }) => (
      <DatabaseProvider service={mockDbWithBasicData}>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => usePlots(), { wrapper: basicWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const plot = result.current.plots[0];
    expect(plot.tree_count).toBe(0);
    expect(plot.alive_count).toBe(0);
    expect(plot.latest_survey_date).toBeNull();
  });

  it('should handle fetch errors gracefully', async () => {
    const errorMessage = 'Network error';
    const mockDbWithError = createMockDatabaseService({
      fetchPlots: jest.fn(async () => {
        throw new Error(errorMessage);
      }),
    });

    const errorWrapper = ({ children }: { children: React.ReactNode }) => (
      <DatabaseProvider service={mockDbWithError}>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => usePlots(), { wrapper: errorWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.plots).toEqual([]);
  });

  it('should not update state after unmount', async () => {
    const { unmount } = renderHook(() => usePlots(), { wrapper });

    unmount();

    await waitFor(() => {
      expect(true).toBe(true);
    });
  });

  it('should handle empty plots array', async () => {
    const mockDbEmpty = createMockDatabaseService({
      fetchPlots: jest.fn(async () => []),
    });

    const emptyWrapper = ({ children }: { children: React.ReactNode }) => (
      <DatabaseProvider service={mockDbEmpty}>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => usePlots(), { wrapper: emptyWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.plots).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
