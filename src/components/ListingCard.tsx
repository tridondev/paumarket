'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { MouseEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/favorites-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import type { Listing } from '@/types';

const CONDITION_LABEL: Record<Listing['condition'], string> = {
  new: 'New',
  used: 'Used',
  'like-new': 'Like New',
  free: 'Free',
  wanted: 'Wanted',
};

function formatPrice(price: number, currency: string, condition: string) {
  if (condition === 'free') return 'Free';
  if (condition === 'wanted') return 'Wanted';
  return `${currency === 'EUR' ? '€' : currency}${price.toLocaleString()}`;
}

function timeAgo(ts: number) {
  // Defensive: normalizeListing() should already guarantee a millisecond
  // number, but guard against NaN/odd input so a bad value shows "today"
  // instead of a nonsensical "666mo ago".
  const days = Number.isFinite(ts) ? Math.floor((Date.now() - ts) / 86_400_000) : 0;
  if (days <= 0) return 'Listed today';
  if (days === 1) return 'Listed yesterday';
  if (days < 7) return `Listed ${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Listed ${weeks}w ago`;
  return `Listed ${Math.floor(days / 30)}mo ago`;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images?.[0];
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openAuthModal } = useAuthModal();
  const favorited = isFavorite(listing.id);

  async function handleFavoriteClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    await toggleFavorite(listing.id);
  }

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="card group overflow-hidden flex flex-col hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-square bg-forest-50 overflow-hidden">
        <button
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Remove from favourites' : 'Save to favourites'}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-cream/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={favorited ? '#c25b3f' : 'none'}
            stroke={favorited ? '#c25b3f' : 'currentColor'}
            className={favorited ? '' : 'text-ink/50'}
          >
            <path
              d="M12 21s-7.5-4.6-10-9.1C.5 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.5C11 6.1 12.4 5 14.4 5c3.5 0 5.2 3.6 3.7 6.9C19.5 16.4 12 21 12 21z"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-[1.05] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-forest-400 text-sm">
            No photo
          </div>
        )}
        {listing.section === 'leaving-pau' ? (
          <span className="ribbon">{listing.cohort || 'Leaving PAU'}</span>
        ) : listing.condition === 'free' ? (
          <span className="ribbon-free">Free</span>
        ) : listing.deliveryAvailable ? (
          <span className="ribbon-free">Delivery</span>
        ) : null}
      </div>
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2 min-h-[2.5em]">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <span className="price">
            {formatPrice(listing.price, listing.currency, listing.condition)}
          </span>
          <span className="tag">{CONDITION_LABEL[listing.condition]}</span>
        </div>
        <div className="flex items-center justify-between border-t border-ink/5 pt-2">
          <span className="flex items-center gap-1.5 text-xs text-ink/50 min-w-0">
            <span className="w-4 h-4 rounded-full bg-forest-100 text-forest-600 text-[9px] font-semibold flex items-center justify-center shrink-0">
              {initials(listing.sellerName)}
            </span>
            <span className="truncate">{listing.location}</span>
          </span>
          <span className="text-[11px] text-ink/40 shrink-0">{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
