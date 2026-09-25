import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getListing } from '@/lib/listings';
import type { Listing } from '@/types';

const FAVORITES_COL = 'favorites';

function favoriteId(uid: string, listingId: string) {
  return `${uid}_${listingId}`;
}

export async function addFavorite(uid: string, listingId: string) {
  await setDoc(doc(db, FAVORITES_COL, favoriteId(uid, listingId)), {
    uid,
    listingId,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(uid: string, listingId: string) {
  await deleteDoc(doc(db, FAVORITES_COL, favoriteId(uid, listingId)));
}

export function favoritesForUserQuery(uid: string) {
  return query(collection(db, FAVORITES_COL), where('uid', '==', uid));
}

/** One-shot fetch of a user's favorited listings, for the /favorites dashboard. */
export async function getFavoriteListings(uid: string): Promise<Listing[]> {
  const snap = await getDocs(favoritesForUserQuery(uid));
  const listingIds = snap.docs.map((d) => d.data().listingId as string);
  const listings = await Promise.all(listingIds.map((id) => getListing(id)));
  return listings.filter((l): l is Listing => l !== null);
}
