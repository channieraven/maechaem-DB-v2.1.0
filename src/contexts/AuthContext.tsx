import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firestoreService } from '../lib/database/firestoreService';
import type { Profile } from '../lib/database.types';

interface AuthContextType {
  user: { uid: string; email?: string | null } | null;
  profile: Profile | null;
  loading: boolean;
  canWrite: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const p = await firestoreService.fetchProfile(fbUser.uid);
          setProfile(p);
        } catch (err) {
          console.error('[AuthContext] Error fetching profile:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const user = firebaseUser
    ? { uid: firebaseUser.uid, email: firebaseUser.email }
    : null;

  const canWrite = !!(
    profile?.approved &&
    ['staff', 'researcher', 'admin'].includes(profile.role)
  );

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, canWrite, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
