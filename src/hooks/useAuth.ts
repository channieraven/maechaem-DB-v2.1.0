// Backward-compatible auth hook.
// Authentication was removed, but several components still consume this API.
// Return safe defaults so the app can render without auth context.
type AuthUser = {
  uid: string;
  email?: string | null;
};

type AuthProfile = {
  id: string;
  fullname?: string | null;
  role?: string | null;
};

type UseAuthResult = {
  user: AuthUser | null;
  profile: AuthProfile | null;
  canWrite: boolean;
  logout: () => Promise<void>;
};

export const useAuth = (): UseAuthResult => {
  return {
    user: null,
    profile: null,
    canWrite: true,
    logout: async () => {
      return;
    },
  };
};
