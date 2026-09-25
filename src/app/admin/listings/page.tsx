'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeListing } from '@/lib/timestamps';
import type { Listing } from '@/types';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setListings(snap.docs.map((d) => normalizeListing(d.data(), d.id)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function setStatus(id: string, status: Listing['status']) {
    setBusyId(id);
    try {
      await updateDoc(doc(db, 'listings', id), { status });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-ink/50 text-sm">Loading…</p>;
  if (listings.length === 0) return <p className="text-ink/50 text-sm">No listings yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {listings.map((l) => (
        <div key={l.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link href={`/listing/${l.id}`} className="font-medium text-ink hover:text-forest-600">
              {l.title}
            </Link>
            <p className="text-xs text-ink/50 mt-1">
              {l.sellerName} · {l.category} · {l.section} ·{' '}
              <span
                className={
                  l.status === 'active'
                    ? 'text-forest-600'
                    : l.status === 'sold'
                    ? 'text-gold-600'
                    : 'text-clay-500'
                }
              >
                {l.status}
              </span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {l.status !== 'active' && (
              <button
                disabled={busyId === l.id}
                onClick={() => setStatus(l.id, 'active')}
                className="btn-secondary !px-3 !py-1.5 text-xs"
              >
                Restore
              </button>
            )}
            {l.status !== 'removed' && (
              <button
                disabled={busyId === l.id}
                onClick={() => setStatus(l.id, 'removed')}
                className="btn-secondary !px-3 !py-1.5 text-xs !border-clay-500 !text-clay-500"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
