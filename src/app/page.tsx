'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import FilterBar from '@/components/FilterBar';
import ListingCard from '@/components/ListingCard';
import { useFilteredListings, useListings } from '@/hooks/useListings';
import { PROMO_IMAGES } from '@/lib/stock-images';

function Shelf({
  title,
  href,
  listings,
}: {
  title: string;
  href: string;
  listings: ReturnType<typeof useListings>['listings'];
}) {
  if (listings.length === 0) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl">{title}</h2>
        <Link href={href} className="text-sm font-medium text-forest-600 hover:underline">
          See all
        </Link>
      </div>
      <div className="shelf-track">
        {listings.slice(0, 8).map((l) => (
          <div key={l.id} className="shelf-item">
            <ListingCard listing={l} />
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeContent() {
  const params = useSearchParams();
  const { listings, loading, error } = useListings('shop');
  const { listings: leavingListings } = useListings('leaving-pau');
  const { listings: exchangeListings } = useListings('exchange');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');

  useEffect(() => {
    const q = params.get('q');
    const cat = params.get('category');
    if (q) setSearch(q);
    if (cat) setCategory(cat);
  }, [params]);

  const filtered = useFilteredListings(listings, search, category, condition);
  const isBrowsing = Boolean(search || category || condition);

  return (
    <div>
      {!isBrowsing && (
        <>
          {/* Promo band — a large "Leaving PAU" tile plus two supporting tiles,
              instead of one oversized marketing hero */}
          <section className="max-w-6xl mx-auto px-4 pt-6">
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-3 h-[280px] md:h-[320px]">
              <div className="promo-tile">
                <Image
                  src={PROMO_IMAGES.leavingPau}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/50 to-forest-900/10" />
                <p className="text-gold-400 text-sm font-medium mb-2 relative">Every graduating cohort</p>
                <h1 className="font-display text-3xl md:text-4xl text-cream leading-[1.1] mb-3 relative">
                  Leaving PAU?<br />Sell it all in one place.
                </h1>
                <p className="text-cream/70 text-sm max-w-sm mb-5 relative">
                  Laptops, fridges, furniture, books — list your graduation sale where
                  the next cohort is already looking.
                </p>
                <Link href="/leaving-pau" className="btn-gold w-fit relative">
                  Browse Leaving PAU sales
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/sell" className="promo-tile flex-1 !justify-between">
                  <Image src={PROMO_IMAGES.store} alt="" fill unoptimized className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-clay-600/90 via-clay-600/40 to-clay-600/10" />
                  <div className="relative">
                    <p className="font-display text-xl text-cream mb-1">Open a student store</p>
                    <p className="text-cream/75 text-xs">Fashion, food, services &amp; more</p>
                  </div>
                </Link>
                <Link href="/exchange" className="promo-tile flex-1 !justify-between">
                  <Image src={PROMO_IMAGES.exchange} alt="" fill unoptimized className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-800/90 via-forest-800/40 to-forest-800/10" />
                  <div className="relative">
                    <p className="font-display text-xl text-cream mb-1">PAU Exchange</p>
                    <p className="text-cream/75 text-xs">Resell what you no longer need</p>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          <Shelf title="Leaving PAU picks" href="/leaving-pau" listings={leavingListings} />
          <Shelf title="Fresh in Exchange" href="/exchange" listings={exchangeListings} />

          <div className="max-w-6xl mx-auto px-4">
            <div className="border-t border-ink/10 pt-6" />
          </div>
        </>
      )}

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">{isBrowsing ? 'Results' : 'All listings'}</h2>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          condition={condition}
          onConditionChange={setCondition}
        />

        <div className="mt-6">
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
              <p className="text-ink/60">No listings match yet.</p>
              <Link href="/sell" className="btn-primary mt-4 inline-flex">
                Be the first to list something
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
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
