'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/favorites-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import { getListing, incrementListingViews } from '@/lib/listings';
import { getOrCreateConversation } from '@/lib/messaging';
import type { Listing } from '@/types';

const LocationView = dynamic(
  () => import('@/components/LocationMap').then((m) => m.LocationView),
  { ssr: false, loading: () => <div className="h-40 rounded border border-ink/15 bg-forest-50 animate-pulse" /> }
);

const CONDITION_LABEL: Record<Listing['condition'], string> = {
  new: 'New',
  used: 'Used',
  'like-new': 'Like New',
  free: 'Free',
  wanted: 'Wanted',
};

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openAuthModal } = useAuthModal();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    getListing(params.id).then((l) => setListing(l));
    incrementListingViews(params.id).catch(() => {});
  }, [params?.id]);

  async function handleContactSeller() {
    if (!listing) return;
    if (!user || !profile) {
      openAuthModal();
      return;
    }
    if (profile.status !== 'approved') {
      router.push('/pending-approval');
      return;
    }
    setContacting(true);
    try {
      const conversationId = await getOrCreateConversation({
        listingId: listing.id,
        listingTitle: listing.title,
        buyerId: profile.uid,
        buyerName: profile.displayName,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
      });
      router.push(`/messages/${conversationId}`);
    } finally {
      setContacting(false);
    }
  }

  if (listing === undefined) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-ink/50">Loading…</div>;
  }
  if (listing === null) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-ink/50">Listing not found.</div>;
  }

  const isOwnListing = profile?.uid === listing.sellerId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-[1.2fr_1fr] gap-10">
      <div>
        <div className="relative aspect-[4/3] bg-forest-50 rounded overflow-hidden">
          {listing.images[activeImage] ? (
            <Image
              src={listing.images[activeImage]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-forest-400">
              No photo
            </div>
          )}
        </div>
        {listing.images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {listing.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-16 rounded overflow-hidden border-2 ${
                  i === activeImage ? 'border-forest-500' : 'border-transparent'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {listing.section === 'leaving-pau' && listing.cohort && (
          <span className="inline-block bg-clay-500 text-cream text-xs font-semibold px-2.5 py-1 rounded-sm mb-3">
            {listing.cohort}
          </span>
        )}
        <h1 className="font-display text-3xl mb-2">{listing.title}</h1>
        <p className="price-lg mb-4">
          {listing.condition === 'free'
            ? 'Free'
            : listing.condition === 'wanted'
            ? 'Wanted'
            : `€${listing.price.toLocaleString()}`}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="tag">{CONDITION_LABEL[listing.condition]}</span>
          <span className="tag">{listing.category}</span>
          <span className="tag">{listing.location}</span>
          {listing.deliveryAvailable && (
            <span className="text-[11px] font-medium border border-forest-600/20 bg-forest-50 text-forest-600 rounded-sm px-1.5 py-0.5">
              Delivery available
            </span>
          )}
        </div>

        <p className="text-ink/70 leading-relaxed whitespace-pre-wrap mb-8">
          {listing.description}
        </p>

        {listing.locationLat != null && listing.locationLng != null && (
          <div className="mb-6">
            <p className="text-xs text-ink/50 mb-2">Meeting point</p>
            <LocationView lat={listing.locationLat} lng={listing.locationLng} label={listing.location} />
          </div>
        )}

        <div className="card p-4 flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-ink/50">Sold by</p>
            <Link href={`/store/${listing.sellerId}`} className="font-medium text-forest-600">
              {listing.sellerName}
            </Link>
          </div>
        </div>

        {isOwnListing ? (
          <p className="text-sm text-ink/50">This is your own listing.</p>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleContactSeller} disabled={contacting} className="btn-primary flex-1">
              {contacting ? 'Opening chat…' : 'Contact Seller'}
            </button>
            <button
              onClick={() => (user ? toggleFavorite(listing.id) : openAuthModal())}
              aria-label={isFavorite(listing.id) ? 'Remove from favourites' : 'Save to favourites'}
              className="btn-secondary !px-4 shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isFavorite(listing.id) ? '#c25b3f' : 'none'}
                stroke={isFavorite(listing.id) ? '#c25b3f' : 'currentColor'}
              >
                <path
                  d="M12 21s-7.5-4.6-10-9.1C.5 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.5C11 6.1 12.4 5 14.4 5c3.5 0 5.2 3.6 3.7 6.9C19.5 16.4 12 21 12 21z"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
