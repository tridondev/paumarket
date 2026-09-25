'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import { addFavorite, favoritesForUserQuery, removeFavorite } from '@/lib/favorites';

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorite: (listingId: string) => boolean;
  /** Returns false (and does nothing) if no one is signed in — caller decides how to prompt. */
  toggleFavorite: (listingId: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favoriteIds: new Set(),
  isFavorite: () => false,
  toggleFavorite: async () => false,
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!profile?.uid) {
      setFavoriteIds(new Set());
      return;
    }
    const unsub = onSnapshot(favoritesForUserQuery(profile.uid), (snap) => {
      setFavoriteIds(new Set(snap.docs.map((d) => d.data().listingId as string)));
    });
    return () => unsub();
  }, [profile?.uid]);

  async function toggleFavorite(listingId: string) {
    if (!profile?.uid) return false;
    if (favoriteIds.has(listingId)) {
      await removeFavorite(profile.uid, listingId);
    } else {
      await addFavorite(profile.uid, listingId);
    }
    return true;
  }

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite: (listingId: string) => favoriteIds.has(listingId),
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
