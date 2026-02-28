import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const { user, profile, canWrite, logout } = useAuthContext();
  return { user, profile, canWrite, logout };
};
