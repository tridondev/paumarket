'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/favorites-context';
import { getFavoriteListings } from '@/lib/favorites';
import ListingCard from '@/components/ListingCard';
import type { Listing } from '@/types';

function FavoritesContent() {
  const { profile } = useAuth();
  const { favoriteIds } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    setLoading(true);
    getFavoriteListings(profile.uid)
      .then(setListings)
      .finally(() => setLoading(false));
    // Re-fetch whenever the set of favorited IDs changes (add/remove elsewhere).
  }, [profile?.uid, favoriteIds.size]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-2">Your favourites</h1>
      <p className="text-ink/60 text-sm mb-8">Products you&rsquo;ve saved for later.</p>

      {loading ? (
        <p className="text-ink/50 text-sm">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-ink/15 rounded">
          <p className="text-ink/60 mb-4">
            Nothing saved yet — tap the heart on any listing to add it here.
          </p>
          <Link href="/" className="btn-primary">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute requireApproval={false}>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
