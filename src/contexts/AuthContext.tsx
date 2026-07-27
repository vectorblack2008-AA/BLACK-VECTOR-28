'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, createUserDocument, handleGoogleRedirect, updateUserProfile } from '@/lib/auth';
import type { User } from '@/lib/types';

const ADMIN_EMAILS: string[] = [
  'phantomdark010@gmail.com',
  'ahmedhamdy7512@gmail.com',
];

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  initialized: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  initialized: false,
  isAdmin: false,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const ensureAdmin = async (user: FirebaseUser, profile: User): Promise<User> => {
  if (ADMIN_EMAILS.includes(user.email || '') && profile.role !== 'admin') {
    const updated = { ...profile, role: 'admin' as const };
    await updateUserProfile(user.uid, { role: 'admin' });
    return updated;
  }
  return profile;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) {
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUserProfile(await ensureAdmin(firebaseUser, profile));
        } else {
          const newProfile = await createUserDocument(firebaseUser);
          setUserProfile(newProfile);
        }
      } catch {
        setUserProfile(null);
      }
    }
  }, [firebaseUser]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const redirectProfile = await handleGoogleRedirect();
          if (redirectProfile) {
            setUserProfile(await ensureAdmin(user, redirectProfile));
          } else {
            let profile = await getUserProfile(user.uid);
            if (!profile && user.email) {
              profile = await createUserDocument(user);
            }
            if (profile) {
              setUserProfile(await ensureAdmin(user, profile));
            } else {
              setUserProfile(null);
            }
          }
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
      setInitialized(true);
    });
    return () => unsub();
  }, []);

  const isAdmin = userProfile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, initialized, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
