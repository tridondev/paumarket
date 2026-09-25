'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminOverview() {
  const [pendingUsers, setPendingUsers] = useState(0);
  const [approvedUsers, setApprovedUsers] = useState(0);
  const [activeListings, setActiveListings] = useState(0);

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, 'users'), where('status', '==', 'pending')),
      (snap) => setPendingUsers(snap.size)
    );
    const unsub2 = onSnapshot(
      query(collection(db, 'users'), where('status', '==', 'approved')),
      (snap) => setApprovedUsers(snap.size)
    );
    const unsub3 = onSnapshot(
      query(collection(db, 'listings'), where('status', '==', 'active')),
      (snap) => setActiveListings(snap.size)
    );
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const stats = [
    { label: 'Pending approvals', value: pendingUsers, href: '/admin/users', highlight: pendingUsers > 0 },
    { label: 'Approved members', value: approvedUsers, href: '/admin/users' },
    { label: 'Active listings', value: activeListings, href: '/admin/listings' },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className={`card p-5 hover:border-forest-500/40 transition-colors ${
            s.highlight ? 'border-clay-500/40 bg-clay-500/5' : ''
          }`}
        >
          <p className="text-xs text-ink/50 mb-2">{s.label}</p>
          <p className="font-display text-3xl">{s.value}</p>
        </Link>
      ))}
    </div>
  );
}
