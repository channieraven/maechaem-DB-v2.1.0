/// <reference types="jest" />

import type { Profile, Plot, Tree, Species } from '../../lib/database.types';
import { createMockUser } from '../mocks/auth';

/**
 * Test fixtures - reusable test data
 */

export const TEST_USER_ID = 'test-user-123';
export const TEST_PLOT_ID = 'plot-1';
export const TEST_TREE_ID = 'tree-1';

export const fixtures = {
  /**
   * Mock Firebase user
   */
  user: createMockUser({
    uid: TEST_USER_ID,
    email: 'test@example.com',
  }),

  /**
   * Mock user profile
   */
  profile: {
    id: TEST_USER_ID,
    email: 'test@example.com',
    fullname: 'Test User',
    position: 'Researcher',
    organization: 'Test Organization',
    role: 'admin' as const,
    approved: true,
    created_at: new Date().toISOString(),
  } as Profile,

  /**
   * Mock user profile - pending approval
   */
  profilePending: {
    id: 'pending-user-456',
    email: 'pending@example.com',
    fullname: 'Pending User',
    position: null,
    organization: null,
    role: 'pending' as const,
    approved: false,
    created_at: new Date().toISOString(),
  } as Profile,

  /**
   * Mock plot
   */
  plot: {
    id: TEST_PLOT_ID,
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
  } as Plot,

  /**
   * Mock plots array
   */
  plots: [
    {
      id: 'plot-1',
      plot_code: 'P01',
      name_short: 'P1',
      owner_name: 'Owner 1',
      group_number: 1,
      area_sq_m: 5000,
      tambon: 'Tambon 1',
      elevation_m: 500,
      boundary_geojson: null,
      note: 'Plot 1',
      created_at: new Date().toISOString(),
    },
    {
      id: 'plot-2',
      plot_code: 'P02',
      name_short: 'P2',
      owner_name: 'Owner 2',
      group_number: 2,
      area_sq_m: 6000,
      tambon: 'Tambon 2',
      elevation_m: 600,
      boundary_geojson: null,
      note: 'Plot 2',
      created_at: new Date().toISOString(),
    },
  ] as Plot[],

  /**
   * Mock tree
   */
  tree: {
    id: TEST_TREE_ID,
    plot_id: TEST_PLOT_ID,
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
  } as Tree,

  /**
   * Mock trees array
   */
  trees: [
    {
      id: 'tree-1',
      plot_id: TEST_PLOT_ID,
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
    {
      id: 'tree-2',
      plot_id: TEST_PLOT_ID,
      tree_number: 2,
      tree_code: 'P01T002',
          species_id: 'species-2',
          tag_label: null,
          row_main: null,
          row_sub: null,
      utm_x: 500010,
      utm_y: 1234577,
          geom: null,
          grid_spacing: null,
          note: null,
      created_at: new Date().toISOString(),
    },
  ] as Tree[],

  /**
   * Mock species
   */
  species: {
    id: 'species-1',
    species_code: 'A01',
    species_group: 'A',
    group_label: 'ไม้ป่า',
    plant_category: 'forest' as const,
    name_th: 'สักทอง',
    name_en: 'Teak',
    name_sci: 'Tectona grandis',
    hex_color: '2d5a27',
    created_at: new Date().toISOString(),
  } as Species,

  /**
   * Mock species array
   */
  speciesList: [
    {
      id: 'species-1',
      species_code: 'A01',
      species_group: 'A',
      group_label: 'ไม้ป่า',
      plant_category: 'forest' as const,
      name_th: 'สักทอง',
      name_en: 'Teak',
      name_sci: 'Tectona grandis',
      hex_color: '2d5a27',
      created_at: new Date().toISOString(),
    },
    {
      id: 'species-2',
      species_code: 'B01',
      species_group: 'B',
      group_label: 'ไม้ผล',
      plant_category: 'fruit' as const,
      name_th: 'มะม่วง',
      name_en: 'Mango',
      name_sci: 'Mangifera indica',
      hex_color: 'f59e0b',
      created_at: new Date().toISOString(),
    },
  ] as Species[],
};
