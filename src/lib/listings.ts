import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { compressImage } from '@/lib/image';
import { normalizeListing } from '@/lib/timestamps';
import type { Listing, ListingSection } from '@/types';

const LISTINGS_COL = 'listings';

export async function createListing(
  data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'status'>
) {
  // Firestore rejects `undefined` field values (e.g. optional locationLat/Lng
  // when no pin was dropped), so strip them before writing.
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(collection(db, LISTINGS_COL), {
    ...clean,
    status: 'active',
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateListing(id: string, data: Partial<Listing>) {
  await updateDoc(doc(db, LISTINGS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteListing(id: string) {
  await deleteDoc(doc(db, LISTINGS_COL, id));
}

export async function getListing(id: string) {
  const snap = await getDoc(doc(db, LISTINGS_COL, id));
  if (!snap.exists()) return null;
  return normalizeListing(snap.data(), snap.id);
}

export async function incrementListingViews(id: string) {
  await updateDoc(doc(db, LISTINGS_COL, id), { views: increment(1) });
}

export function buildListingsQuery(filters: {
  section?: ListingSection;
  category?: string;
  sellerId?: string;
}) {
  const constraints: QueryConstraint[] = [where('status', '==', 'active')];
  if (filters.section) constraints.push(where('section', '==', filters.section));
  if (filters.category) constraints.push(where('category', '==', filters.category));
  if (filters.sellerId) constraints.push(where('sellerId', '==', filters.sellerId));
  constraints.push(orderBy('createdAt', 'desc'));
  return query(collection(db, LISTINGS_COL), ...constraints);
}

export function listingsCollectionRef() {
  return collection(db, LISTINGS_COL);
}

export async function uploadListingImage(file: File, sellerId: string): Promise<string> {
  const compressed = await compressImage(file);
  const path = `listings/${sellerId}/${Date.now()}-${compressed.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed);
  return getDownloadURL(storageRef);
}

export async function uploadAvatarImage(file: File, uid: string): Promise<string> {
  // Small square-ish crop target — avatars never need to be full-res.
  const compressed = await compressImage(file, { maxDimension: 512, quality: 0.85 });
  const path = `avatars/${uid}/${Date.now()}-${compressed.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed);
  return getDownloadURL(storageRef);
}
