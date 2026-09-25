import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeStoreProfile } from '@/lib/timestamps';
import type { StoreProfile } from '@/types';

const STORE_PROFILES_COL = 'storeProfiles';

/**
 * Reads the public storefront doc for a seller — safe to call for signed-out
 * visitors, since /storeProfiles/{uid} only ever holds display-safe fields
 * (see firestore.rules). Returns null if the seller hasn't loaded the app
 * since this mirror was introduced yet (auth-context backfills it the next
 * time they sign in) or the uid doesn't exist.
 */
export async function getStoreProfile(uid: string): Promise<StoreProfile | null> {
  const snap = await getDoc(doc(db, STORE_PROFILES_COL, uid));
  if (!snap.exists()) return null;
  return normalizeStoreProfile(snap.data(), uid);
}
