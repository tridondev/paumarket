'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FilterBar from '@/components/FilterBar';
import ListingCard from '@/components/ListingCard';
import { useFilteredListings, useListings } from '@/hooks/useListings';
import type { ListingSection } from '@/types';

export default function SectionBrowser({
  section,
  eyebrow,
  title,
  description,
  emptyLabel,
  bannerImage,
}: {
  section: ListingSection;
  eyebrow: string;
  title: string;
  description: string;
  emptyLabel: string;
  bannerImage?: string;
}) {
  const { listings, loading, error } = useListings(section);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const filtered = useFilteredListings(listings, search, category, condition);

  return (
    <div>
      {bannerImage && (
        <div className="relative h-40 md:h-52 overflow-hidden">
          <Image src={bannerImage} alt="" fill unoptimized className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/40 to-forest-900/10" />
          <div className="relative max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-5">
            <p className="text-gold-400 text-sm font-medium mb-1">{eyebrow}</p>
            <h1 className="font-display text-2xl md:text-4xl text-cream">{title}</h1>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!bannerImage && (
          <>
            <p className="text-clay-500 text-sm font-medium mb-2">{eyebrow}</p>
            <h1 className="font-display text-3xl md:text-4xl mb-3">{title}</h1>
          </>
        )}
        <p className="text-ink/60 max-w-2xl mb-8 leading-relaxed">{description}</p>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          condition={condition}
          onConditionChange={setCondition}
        />

        <div className="mt-8">
          {error ? (
            <div className="text-center py-20 border border-dashed border-clay-500/30 bg-clay-500/5 rounded">
              <p className="text-clay-600 font-medium mb-1">Couldn&rsquo;t load listings</p>
              <p className="text-ink/50 text-sm max-w-md mx-auto">{error}</p>
              <p className="text-ink/40 text-xs mt-2">
                This is usually a missing Firestore index — check the browser console for a link to create it.
              </p>
            </div>
          ) : loading ? (
            <p className="text-ink/50 text-sm">Loading listings…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-ink/15 rounded">
              <p className="text-ink/60">{emptyLabel}</p>
              <Link href="/sell" className="btn-primary mt-4 inline-flex">
                Create a listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
