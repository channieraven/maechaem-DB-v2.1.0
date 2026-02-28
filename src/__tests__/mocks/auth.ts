/// <reference types="jest" />

import type { Profile, UserRole } from '../../lib/database.types';

// ── Mock User ───────────────────────────────────────────────────────────────

interface MockUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    ...overrides,
  };
}

// ── Mock Auth Service ───────────────────────────────────────────────────────

interface RegisterData {
  email: string;
  password: string;
  fullname: string;
  position?: string;
  organization?: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
}

let currentUser: MockUser | null = null;

export const mockAuthService = {
  register: jest.fn(async (data: RegisterData): Promise<AuthResult> => {
    currentUser = createMockUser({ uid: `user-${Date.now()}`, email: data.email });
    return { success: true };
  }),

  login: jest.fn(async (email: string, _password: string): Promise<AuthResult> => {
    if (email === 'wrong@test.com') {
      return { success: false, message: 'Invalid credentials' };
    }
    currentUser = createMockUser({ uid: 'test-user-123', email });
    return { success: true };
  }),

  logout: jest.fn(async (): Promise<void> => {
    currentUser = null;
  }),

  getCurrentUser: jest.fn((): MockUser | null => currentUser),
};

// ── Mock Auth Context ───────────────────────────────────────────────────────

interface MockAuthContext {
  user: MockUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  isApproved: boolean;
  canWrite: boolean;
}

export function createMockAuthContext(
  overrides?: Partial<{ isApproved: boolean; role: UserRole }>,
): MockAuthContext {
  const role = overrides?.role ?? 'admin';
  const isApproved = overrides?.isApproved ?? true;
  const canWrite = isApproved && ['staff', 'researcher', 'admin'].includes(role);

  return {
    user: createMockUser(),
    profile: {
      id: 'test-user-123',
      email: 'test@example.com',
      fullname: 'Test User',
      position: 'Researcher',
      organization: 'Test Organization',
      role,
      approved: isApproved,
      created_at: new Date().toISOString(),
    },
    isAdmin: role === 'admin',
    isApproved,
    canWrite,
  };
}
