/// <reference types="jest" />

/**
 * Tests for Firestore Service Mock
 * Tests database operations without real Firestore
 */
import { mockFirestoreService, createMockDatabaseService } from '../../../lib/database/firestoreService.mock';
import { fixtures } from '../../fixtures';

describe('Firestore Service - Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Operations', () => {
    it('should fetch profile by user ID', async () => {
      const profile = await mockFirestoreService.fetchProfile('test-user-123');

      expect(profile).toBeDefined();
      expect(profile?.id).toBe('test-user-123');
      expect(profile?.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      const profile = await mockFirestoreService.fetchProfile('non-existent');

      expect(profile).toBeNull();
    });

    it('should create profile', async () => {
      const result = await mockFirestoreService.createProfile(
        'new-user-123',
        'newuser@example.com',
        'New User',
        'Researcher',
        'Test Organization'
      );

      expect(result.profile).toBeDefined();
      expect(result.profile.email).toBe('newuser@example.com');
      expect(result.profile.fullname).toBe('New User');
      expect(mockFirestoreService.createProfile).toHaveBeenCalled();
    });

    it('should update profile', async () => {
      await mockFirestoreService.updateProfile('test-user-123', {
        fullname: 'Updated Name',
        position: 'Admin',
      });

      expect(mockFirestoreService.updateProfile).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          fullname: 'Updated Name',
          position: 'Admin',
        })
      );
    });
  });

  describe('Plot Operations', () => {
    it('should fetch all plots', async () => {
      const plots = await mockFirestoreService.fetchPlots();

      expect(Array.isArray(plots)).toBe(true);
      expect(plots.length).toBeGreaterThan(0);
      expect(plots[0]).toHaveProperty('plot_code');
    });

    it('should fetch single plot by ID', async () => {
      const plot = await mockFirestoreService.fetchPlot('plot-1');

      expect(plot).toBeDefined();
      expect(plot?.id).toBe('plot-1');
      expect(plot?.plot_code).toBe('P01');
    });

    it('should contain all required plot fields', async () => {
      const plots = await mockFirestoreService.fetchPlots();
      const plot = plots[0];

      expect(plot).toHaveProperty('id');
      expect(plot).toHaveProperty('plot_code');
      expect(plot).toHaveProperty('owner_name');
      expect(plot).toHaveProperty('area_sq_m');
      expect(plot).toHaveProperty('elevation_m');
    });
  });

  describe('Tree Operations', () => {
    it('should fetch trees by plot', async () => {
      const trees = await mockFirestoreService.fetchTreesByPlot('plot-1');

      expect(Array.isArray(trees)).toBe(true);
      expect(trees.length).toBeGreaterThan(0);
      expect(trees[0].plot_id).toBe('plot-1');
    });

    it('should fetch single tree by code', async () => {
      const tree = await mockFirestoreService.fetchTreeByCode('P01T001');

      expect(tree).toBeDefined();
      expect(tree?.tree_code).toBe('P01T001');
    });

    it('should contain all required tree fields', async () => {
      const trees = await mockFirestoreService.fetchTreesByPlot('plot-1');
      const tree = trees[0];

      expect(tree).toHaveProperty('tree_number');
      expect(tree).toHaveProperty('tree_code');
      expect(tree).toHaveProperty('species_id');
      expect(tree).toHaveProperty('plot_id');
      expect(tree).toHaveProperty('utm_x');
      expect(tree).toHaveProperty('utm_y');
    });
  });

  describe('Species Operations', () => {
    it('should fetch all species', async () => {
      const species = await mockFirestoreService.fetchSpecies();

      expect(Array.isArray(species)).toBe(true);
      expect(species.length).toBeGreaterThan(0);
    });

    it('should contain all required species fields', async () => {
      const species = await mockFirestoreService.fetchSpecies();
      const singleSpecies = species[0];

      expect(singleSpecies).toHaveProperty('species_code');
      expect(singleSpecies).toHaveProperty('name_th');
      expect(singleSpecies).toHaveProperty('plant_category');
      expect(singleSpecies).toHaveProperty('hex_color');
    });
  });

  describe('createMockDatabaseService', () => {
    it('should allow custom responses', async () => {
      const customService = createMockDatabaseService({
        fetchPlots: jest.fn(async () => []),
      });

      const plots = await customService.fetchPlots();

      expect(plots).toEqual([]);
    });

    it('should preserve unmocked methods', async () => {
      const customService = createMockDatabaseService({
        fetchPlots: jest.fn(async () => []),
      });

      // fetchProfile should still be the default mock
      const profile = await customService.fetchProfile('test-user-123');

      expect(profile).toBeDefined();
    });
  });

  describe('Mocking behavior', () => {
    it('should allow verifying method calls', async () => {
      await mockFirestoreService.fetchPlots();
      await mockFirestoreService.fetchPlots();

      expect(mockFirestoreService.fetchPlots).toHaveBeenCalledTimes(2);
    });

    it('should show call arguments', async () => {
      await mockFirestoreService.updateProfile('user-123', { fullname: 'Test' });

      expect(mockFirestoreService.updateProfile).toHaveBeenCalledWith(
        'user-123',
        { fullname: 'Test' }
      );
    });
  });

  describe('Integration with fixtures', () => {
    it('should work with test fixtures', async () => {
      const profiles = await Promise.all([
        mockFirestoreService.fetchProfile(fixtures.user.uid),
      ]);

      expect(profiles[0]).toBeDefined();
    });

    it('should handle multiple concurrent calls', async () => {
      const results = await Promise.all([
        mockFirestoreService.fetchPlots(),
        mockFirestoreService.fetchSpecies(),
        mockFirestoreService.fetchTreesByPlot('plot-1'),
      ]);

      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
      expect(results[2]).toBeDefined();
    });
  });
});
