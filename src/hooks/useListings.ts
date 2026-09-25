'use client';

import { useEffect, useMemo, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { buildListingsQuery } from '@/lib/listings';
import { normalizeListing } from '@/lib/timestamps';
import type { Listing, ListingSection } from '@/types';

export function useListings(section?: ListingSection, sellerId?: string) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = buildListingsQuery({ section, sellerId });
    const unsub = onSnapshot(
      q,
      (snap) => {
        setListings(snap.docs.map((d) => normalizeListing(d.data(), d.id)));
        setLoading(false);
      },
      (err) => {
        console.error('[useListings] query failed:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, sellerId]);

  return { listings, loading, error };
}

export function useFilteredListings(
  listings: Listing[],
  search: string,
  category: string,
  condition: string
) {
  return useMemo(() => {
    const term = search.trim().toLowerCase();
    return listings.filter((l) => {
      if (term) {
        const haystack = `${l.title} ${l.description}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (category && l.category !== category) return false;
      if (condition && condition !== 'all' && l.condition !== condition) return false;
      return true;
    });
  }, [listings, search, category, condition]);
}
