'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { normalizeUserProfile } from '@/lib/timestamps';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (
    name: string,
    email: string,
    password: string,
    extra?: { studentId?: string; programme?: string; cohort?: string }
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (
    updates: Partial<
      Pick<UserProfile, 'displayName' | 'studentId' | 'programme' | 'cohort' | 'photoURL'>
    >
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getAllowedDomains(): string[] {
  const raw = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS || '';
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export function isPauEmail(email: string): boolean {
  const domains = getAllowedDomains();
  if (domains.length === 0) return true; // no restriction configured
  const lower = email.toLowerCase();
  return domains.some((d) => lower.endsWith('@' + d));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const normalized = snap.exists() ? normalizeUserProfile(snap.data()) : null;
      setProfile(normalized);
      setLoading(false);

      if (normalized) {
        // Keep the public /storeProfiles/{uid} mirror in sync with only the
        // fields that are safe to show a signed-out visitor. This is a
        // best-effort, idempotent merge write — safe to fire on every load.
        // It also self-heals accounts created before this mirror existed,
        // since it runs any time the account owner's own profile loads.
        setDoc(
          doc(db, 'storeProfiles', normalized.uid),
          {
            displayName: normalized.displayName,
            storeName: normalized.storeName || '',
            bio: normalized.bio || '',
            photoURL: normalized.photoURL || '',
            joinedAt: normalized.createdAt,
          },
          { merge: true }
        ).catch((err) => {
          console.error('[auth-context] failed to sync storeProfiles mirror:', err);
        });
      }
    });
    return () => unsubProfile();
  }, [user]);

  async function signUp(
    name: string,
    email: string,
    password: string,
    extra?: { studentId?: string; programme?: string; cohort?: string }
  ) {
    if (!isPauEmail(email)) {
      throw new Error(
        'This email domain isn\'t on the allowed list — check with an admin if you think this is a mistake.'
      );
    }
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    const newProfile: UserProfile = {
      uid: credential.user.uid,
      displayName: name,
      email,
      status: 'pending',
      isAdmin: false,
      studentId: extra?.studentId || '',
      programme: extra?.programme || '',
      cohort: extra?.cohort || '',
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
    });
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signOutUser() {
    await firebaseSignOut(auth);
  }

  async function updateUserProfile(
    updates: Partial<
      Pick<UserProfile, 'displayName' | 'studentId' | 'programme' | 'cohort' | 'photoURL'>
    >
  ) {
    if (!user) throw new Error('You need to be signed in to update your profile.');
    const clean = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    await updateDoc(doc(db, 'users', user.uid), clean);
    if (updates.displayName || updates.photoURL) {
      await updateProfile(user, {
        ...(updates.displayName ? { displayName: updates.displayName } : {}),
        ...(updates.photoURL ? { photoURL: updates.photoURL } : {}),
      });
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOutUser, updateUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
