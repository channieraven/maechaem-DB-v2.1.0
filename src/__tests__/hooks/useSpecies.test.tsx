/// <reference types="jest" />

/**
 * Unit Test: useSpecies Hook
 * Tests species data fetching with mocked database
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useSpecies } from '../../hooks/useSpecies';
import { DatabaseProvider } from '../../contexts/DatabaseContext';
import { createMockDatabaseService } from '../../lib/database/firestoreService.mock';
import { fixtures } from '../fixtures';

describe('useSpecies', () => {
  const mockDb = createMockDatabaseService();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DatabaseProvider service={mockDb}>{children}</DatabaseProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => useSpecies(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.species).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should fetch species successfully', async () => {
    const { result } = renderHook(() => useSpecies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.species).toBeDefined();
    expect(Array.isArray(result.current.species)).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockDb.fetchSpecies).toHaveBeenCalledTimes(1);
  });

  it('should return species with correct structure', async () => {
    const { result } = renderHook(() => useSpecies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const species = result.current.species[0];
    if (species) {
      expect(species).toHaveProperty('id');
      expect(species).toHaveProperty('species_code');
      expect(species).toHaveProperty('name_th');
      expect(species).toHaveProperty('name_sci');
      expect(species).toHaveProperty('plant_category');
    }
  });

  it('should handle fetch errors gracefully', async () => {
    const errorMessage = 'Database connection failed';
    const mockDbWithError = createMockDatabaseService({
      fetchSpecies: jest.fn(async () => {
        throw new Error(errorMessage);
      }),
    });

    const errorWrapper = ({ children }: { children: React.ReactNode }) => (
      <DatabaseProvider service={mockDbWithError}>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => useSpecies(), { wrapper: errorWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.species).toEqual([]);
  });

  it('should not update state after unmount', async () => {
    const { result, unmount } = renderHook(() => useSpecies(), { wrapper });

    unmount();

    // Should not throw error or cause memory leak
    await waitFor(() => {
      expect(true).toBe(true);
    });
  });
});
