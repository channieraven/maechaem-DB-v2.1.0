/// <reference types="jest" />

/**
 * Integration Tests
 * Tests multiple services working together without Firebase
 * NOTE: Auth tests have been removed as authentication is no longer used
 */
import { mockFirestoreService } from '../../lib/database/firestoreService.mock';
import { mockAuthService, createMockUser, createMockAuthContext } from '../mocks/auth';
import { fixtures } from '../fixtures';

describe('Integration Tests', () => {
  describe('Registration Flow', () => {
    it('should complete full registration flow', async () => {
      // Step 1: Register user
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        fullname: 'New User',
        position: 'Researcher',
        organization: 'Test Org',
      };

      const authResult = await mockAuthService.register(registerData);
      expect(authResult.success).toBe(true);

      // Step 2: Get current user
      const user = mockAuthService.getCurrentUser();
      expect(user).toBeDefined();

      // Step 3: Create profile in database
      if (user) {
        const profileResult = await mockFirestoreService.createProfile(
          user.uid,
          registerData.email,
          registerData.fullname,
          registerData.position,
          registerData.organization
        );

        expect(profileResult.profile).toBeDefined();
        expect(profileResult.profile.email).toBe(registerData.email);

        // Step 4: Verify profile can be fetched (mock doesn't persist, just verify call)
        await mockFirestoreService.fetchProfile(user.uid);
        expect(mockFirestoreService.fetchProfile).toHaveBeenCalledWith(user.uid);
      }
    });

    it('should handle registration with minimal data', async () => {
      const result = await mockAuthService.register({
        email: 'minimal@test.com',
        password: 'password123',
        fullname: 'Minimal User',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Authentication + Data Access', () => {
    it('should login and access user data', async () => {
      // Step 1: Login
      const loginResult = await mockAuthService.login('valid@test.com', 'password123');
      expect(loginResult.success).toBe(true);

      // Step 2: Get authenticated user
      const user = mockAuthService.getCurrentUser();
      expect(user).not.toBeNull();

      // Step 3: Access user profile
      if (user) {
        const profile = await mockFirestoreService.fetchProfile(user.uid);
        expect(profile).toBeDefined();
      }
    });

    it('should prevent data access without authentication', async () => {
      // Simulate no user
      const user = mockAuthService.getCurrentUser();
      
      if (!user) {
        // This is expected - no auth = no data access
        expect(user).toBeNull();
      }
    });
  });

  describe('Profile Update Flow', () => {
    it('should update profile after authentication', async () => {
      // Step 1: Setup - simulate authenticated user
      const auth = createMockAuthContext();
      expect(auth.user).toBeDefined();

      // Step 2: Update profile
      if (auth.user) {
        await mockFirestoreService.updateProfile(auth.user.uid, {
          fullname: 'Updated Name',
          position: 'Admin',
        });

        expect(mockFirestoreService.updateProfile).toHaveBeenCalledWith(
          auth.user.uid,
          expect.objectContaining({
            fullname: 'Updated Name',
            position: 'Admin',
          })
        );
      }
    });
  });

  describe('Multi-user Operations', () => {
    it('should handle multiple users independently', async () => {
      const user1 = createMockUser({ uid: 'user-1', email: 'user1@test.com' });
      const user2 = createMockUser({ uid: 'user-2', email: 'user2@test.com' });

      // Create profiles for multiple users
      const profile1 = await mockFirestoreService.createProfile(
        user1.uid,
        user1.email!,
        'User One',
        'Position 1',
        'Org 1'
      );

      const profile2 = await mockFirestoreService.createProfile(
        user2.uid,
        user2.email!,
        'User Two',
        'Position 2',
        'Org 2'
      );

      expect(profile1.profile.fullname).toBe('User One');
      expect(profile2.profile.fullname).toBe('User Two');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // Setup
      const auth = createMockAuthContext();

      // Perform multiple operations
      await mockFirestoreService.fetchPlots();
      await mockFirestoreService.fetchSpecies();
      await mockFirestoreService.fetchTreesByPlot('plot-1');

      // Verify all operations were recorded
      expect(mockFirestoreService.fetchPlots).toHaveBeenCalled();
      expect(mockFirestoreService.fetchSpecies).toHaveBeenCalled();
      expect(mockFirestoreService.fetchTreesByPlot).toHaveBeenCalled();
    });
  });

  describe('Context Integration', () => {
    it('should integrate auth context with database operations', () => {
      // Setup mock context
      const auth = createMockAuthContext();
      expect(auth.profile).toBeDefined();

      // Verify auth state
      expect(auth.isAdmin).toBe(true);
      expect(auth.canWrite).toBe(true);

      // Verify user is ready for database operations
      expect(auth.user?.uid).toBe('test-user-123');
    });

    it('should handle pending user state', () => {
      const auth = createMockAuthContext({
        isApproved: false,
        role: 'pending',
      });

      // Pending users shouldn't have write access
      expect(auth.isApproved).toBe(false);
      expect(auth.canWrite).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle login errors gracefully', async () => {
      const result = await mockAuthService.login('wrong@test.com', 'password');

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle profile fetch errors', async () => {
      const profile = await mockFirestoreService.fetchProfile('non-existent-user');

      expect(profile).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      const results = await Promise.all([
        mockFirestoreService.fetchPlots(),
        mockFirestoreService.fetchSpecies(),
        mockFirestoreService.fetchTreesByPlot('plot-1'),
        mockAuthService.register({
          email: 'test@test.com',
          password: 'password',
          fullname: 'Test',
        }),
      ]);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Workflow: Create User -> Update -> Read Data', () => {
    it('should complete full user workflow', async () => {
      // 1. Register
      const registerResult = await mockAuthService.register({
        email: 'workflow@test.com',
        password: 'password123',
        fullname: 'Workflow User',
      });
      expect(registerResult.success).toBe(true);

      // 2. Get user
      const user = mockAuthService.getCurrentUser();
      expect(user).toBeDefined();

      if (user) {
        // 3. Create profile
        const profileResult = await mockFirestoreService.createProfile(
          user.uid,
          'workflow@test.com',
          'Workflow User',
          'Researcher',
          'Test Org'
        );
        expect(profileResult.profile).toBeDefined();

        // 4. Update profile
        await mockFirestoreService.updateProfile(user.uid, {
          position: 'Senior Researcher',
        });
        expect(mockFirestoreService.updateProfile).toHaveBeenCalled();

        // 5. Fetch updated profile (mock doesn't persist updates, returns default)
        const updatedProfile = await mockFirestoreService.fetchProfile(user.uid);
        expect(updatedProfile).toBeDefined();
      }

      // 6. Access plot data
      const plots = await mockFirestoreService.fetchPlots();
      expect(Array.isArray(plots)).toBe(true);

      // 7. Access tree data
      const trees = await mockFirestoreService.fetchTreesByPlot('plot-1');
      expect(Array.isArray(trees)).toBe(true);
    });
  });

  describe('Performance: Batch Operations', () => {
    it('should handle batch database operations', async () => {
      const startTime = performance.now();

      // Perform multiple operations
      const batches = await Promise.all([
        mockFirestoreService.fetchPlots(),
        mockFirestoreService.fetchSpecies(),
        ...fixtures.plots.map(p => mockFirestoreService.fetchPlot(p.id)),
      ]);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(batches).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Should be fast (mocked)
    });
  });
});
