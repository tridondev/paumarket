'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useListings } from '@/hooks/useListings';
import ListingCard from '@/components/ListingCard';
import { getStoreProfile } from '@/lib/store-profiles';
import type { StoreProfile } from '@/types';

function formatJoinDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function StorePage() {
  const params = useParams<{ userId: string }>();
  const { profile: myProfile } = useAuth();
  // Fetched from the public /storeProfiles mirror, not /users — this is what
  // lets signed-out visitors see a seller's storefront at all.
  const [storeOwner, setStoreOwner] = useState<StoreProfile | null | undefined>(undefined);
  const { listings, loading, error } = useListings(undefined, params?.userId);

  const [editing, setEditing] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwner = myProfile?.uid === params?.userId;
  const canAddProducts = isOwner && myProfile?.status === 'approved';

  useEffect(() => {
    if (!params?.userId) return;
    getStoreProfile(params.userId).then((data) => {
      setStoreOwner(data);
      setStoreName(data?.storeName || '');
      setBio(data?.bio || '');
    });
  }, [params?.userId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!params?.userId) return;
    setSaving(true);
    try {
      // Write to the private /users doc — auth-context mirrors storeName/bio
      // into the public /storeProfiles doc automatically the moment this
      // owner's own profile listener picks up the change.
      await updateDoc(doc(db, 'users', params.userId), { storeName, bio });
      setStoreOwner((prev) => (prev ? { ...prev, storeName, bio } : prev));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (storeOwner === undefined) {
    return <div className="max-w-6xl mx-auto px-4 py-20 text-center text-ink/50">Loading…</div>;
  }
  if (storeOwner === null) {
    return <div className="max-w-6xl mx-auto px-4 py-20 text-center text-ink/50">Store not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-forest-600 text-sm font-medium mb-1">Student store</p>
          <h1 className="font-display text-3xl mb-2">
            {storeOwner.storeName || storeOwner.displayName}
          </h1>
          {storeOwner.storeName && (
            <p className="text-ink/50 text-sm mb-2">by {storeOwner.displayName}</p>
          )}
          <p className="text-ink/70 max-w-xl leading-relaxed mb-2">
            {storeOwner.bio || 'This seller has not added a store description yet.'}
          </p>
          <p className="text-ink/40 text-xs">
            {listings.length} product{listings.length === 1 ? '' : 's'}
            {storeOwner.joinedAt ? ` · Joined ${formatJoinDate(storeOwner.joinedAt)}` : ''}
          </p>
        </div>
        {isOwner && !editing && (
          <div className="flex gap-2 shrink-0">
            {canAddProducts && (
              <Link href="/sell" className="btn-primary">
                + Add product
              </Link>
            )}
            <button onClick={() => setEditing(true)} className="btn-secondary">
              Edit store
            </button>
          </div>
        )}
      </div>

      {editing && (
        <form onSubmit={handleSave} className="card p-5 mb-10 flex flex-col gap-4 max-w-md">
          <div>
            <label className="label">Store name</label>
            <input className="field" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder={storeOwner.displayName} />
          </div>
          <div>
            <label className="label">About your store</label>
            <textarea className="field min-h-[90px]" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

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
      ) : listings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-ink/15 rounded">
          <p className="text-ink/50 text-sm mb-4">No active listings from this store yet.</p>
          {canAddProducts && (
            <Link href="/sell" className="btn-primary">
              + Add your first product
            </Link>
          )}
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
