import { Timestamp } from 'firebase/firestore';
import type { ChatMessage, Conversation, Favorite, Listing, StoreProfile, UserProfile } from '@/types';

/**
 * Firestore's serverTimestamp() is written as a Timestamp object, not a
 * plain number — but our types declare createdAt/updatedAt/lastMessageAt as
 * `number` for convenience everywhere else in the app (date-fns, sorting,
 * simple subtraction for "time ago" labels). Reading a raw Timestamp as if
 * it were milliseconds silently corrupts every date in the app (Timestamp's
 * numeric coercion is in *seconds*, so a listing from a minute ago looked
 * like it was posted hundreds of months ago).
 *
 * Always pass every timestamp-ish field through this before it leaves the
 * data layer.
 */
export function toMillis(value: unknown): number {
  if (value == null) {
    // serverTimestamp() resolves to null in the local cache for a split
    // second before the server confirms it — treat that as "just now"
    // rather than as epoch 0 (which would show as "54 years ago").
    return Date.now();
  }
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  if (
    typeof value === 'object' &&
    'seconds' in (value as Record<string, unknown>) &&
    'nanoseconds' in (value as Record<string, unknown>)
  ) {
    const { seconds, nanoseconds } = value as { seconds: number; nanoseconds: number };
    return seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
  }
  return Date.now();
}

export function normalizeListing(raw: Record<string, unknown>, id: string): Listing {
  return {
    ...(raw as Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: toMillis(raw.createdAt),
    updatedAt: toMillis(raw.updatedAt),
  };
}

export function normalizeUserProfile(raw: Record<string, unknown>): UserProfile {
  return {
    ...(raw as Omit<UserProfile, 'createdAt'>),
    createdAt: toMillis(raw.createdAt),
  };
}

export function normalizeStoreProfile(raw: Record<string, unknown>, uid: string): StoreProfile {
  return {
    uid,
    displayName: (raw.displayName as string) || '',
    storeName: (raw.storeName as string) || '',
    bio: (raw.bio as string) || '',
    photoURL: (raw.photoURL as string) || '',
    joinedAt: toMillis(raw.joinedAt),
  };
}

export function normalizeFavorite(raw: Record<string, unknown>, id: string): Favorite {
  return {
    ...(raw as Omit<Favorite, 'id' | 'createdAt'>),
    id,
    createdAt: toMillis(raw.createdAt),
  };
}

export function normalizeConversation(raw: Record<string, unknown>, id: string): Conversation {
  return {
    ...(raw as Omit<Conversation, 'id' | 'lastMessageAt'>),
    id,
    lastMessageAt: toMillis(raw.lastMessageAt),
  };
}

export function normalizeChatMessage(raw: Record<string, unknown>, id: string): ChatMessage {
  return {
    ...(raw as Omit<ChatMessage, 'id' | 'createdAt'>),
    id,
    createdAt: toMillis(raw.createdAt),
  };
}
