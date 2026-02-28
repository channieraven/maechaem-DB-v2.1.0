/// <reference types="jest" />

import type { DatabaseService } from './firestoreService';
import type { Profile, Plot, Tree, Species, GrowthLog } from '../database.types';

/**
 * Create a fully-typed mock DatabaseService for testing.
 * Every method is a jest.fn() with sensible defaults.
 */
export function createMockDatabaseService(
  overrides?: Partial<Record<keyof DatabaseService, jest.Mock>>,
): DatabaseService & Record<keyof DatabaseService, jest.Mock> {
  const defaults: Record<keyof DatabaseService, jest.Mock> = {
    // Profiles
    fetchProfile: jest.fn(async (userId: string): Promise<Profile | null> => {
      if (userId === 'test-user-123') {
        return {
          id: userId,
          email: 'test@example.com',
          fullname: 'Test User',
          position: 'Researcher',
          organization: 'Test Org',
          role: 'admin',
          approved: true,
          created_at: new Date().toISOString(),
        };
      }
      return null;
    }),

    createProfile: jest.fn(
      async (
        userId: string,
        email: string,
        fullname: string,
        position?: string,
        organization?: string,
      ): Promise<{ profile: Profile; isFirstUser: boolean }> => ({
        profile: {
          id: userId,
          email,
          fullname,
          position: position || null,
          organization: organization || null,
          role: 'pending',
          approved: false,
          created_at: new Date().toISOString(),
        },
        isFirstUser: false,
      }),
    ),

    updateProfile: jest.fn(async (): Promise<void> => {}),

    // Plots
    fetchPlots: jest.fn(async (): Promise<Plot[]> => [
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
        note: 'Test plot',
        created_at: new Date().toISOString(),
      },
    ]),

    fetchPlot: jest.fn(async (plotId: string): Promise<Plot | null> => ({
      id: plotId,
      plot_code: 'P01',
      name_short: 'P1',
      owner_name: 'Test Owner',
      group_number: 1,
      area_sq_m: 5000,
      tambon: 'Test Tambon',
      elevation_m: 500,
      boundary_geojson: null,
      note: 'Test plot',
      created_at: new Date().toISOString(),
    })),

    createPlot: jest.fn(async (): Promise<string> => 'new-plot-id'),

    updatePlot: jest.fn(async (): Promise<void> => {}),

    // Trees
    fetchTreesByPlot: jest.fn(async (plotId: string): Promise<Tree[]> => [
      {
        id: 'tree-1',
        plot_id: plotId,
        tree_number: 1,
        tree_code: 'P01T001',
        species_id: 'species-1',
        tag_label: null,
        row_main: null,
        row_sub: null,
        utm_x: 500000,
        utm_y: 1234567,
        geom: null,
        grid_spacing: null,
        note: null,
        created_at: new Date().toISOString(),
      },
    ]),

    fetchTreeByCode: jest.fn(async (treeCode: string): Promise<Tree | null> => ({
      id: 'tree-1',
      plot_id: 'plot-1',
      tree_number: 1,
      tree_code: treeCode,
      species_id: 'species-1',
      tag_label: null,
      row_main: null,
      row_sub: null,
      utm_x: 500000,
      utm_y: 1234567,
      geom: null,
      grid_spacing: null,
      note: null,
      created_at: new Date().toISOString(),
    })),

    createTree: jest.fn(async (): Promise<string> => 'new-tree-id'),

    updateTree: jest.fn(async (): Promise<void> => {}),

    // Growth Logs
    fetchGrowthLogsByPlot: jest.fn(async (): Promise<GrowthLog[]> => []),

    fetchGrowthLogsByTree: jest.fn(async (): Promise<GrowthLog[]> => []),

    createGrowthLog: jest.fn(async (): Promise<string> => 'new-log-id'),

    // Species
    fetchSpecies: jest.fn(async (): Promise<Species[]> => [
      {
        id: 'species-1',
        species_code: 'A01',
        species_group: 'A',
        group_label: 'ไม้ป่า',
        plant_category: 'forest',
        name_th: 'สักทอง',
        name_en: 'Teak',
        name_sci: 'Tectona grandis',
        hex_color: '2d5a27',
        created_at: new Date().toISOString(),
      },
    ]),
  };

  return { ...defaults, ...overrides } as DatabaseService & Record<keyof DatabaseService, jest.Mock>;
}

/** Pre-built mock instance for convenience */
export const mockFirestoreService = createMockDatabaseService();

/** @deprecated Use createMockDatabaseService instead */
export const createMockFirestoreService = createMockDatabaseService;
