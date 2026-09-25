'use client';

import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeUserProfile } from '@/lib/timestamps';
import type { ApprovalStatus, UserProfile } from '@/types';

const TABS: { value: ApprovalStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminUsersPage() {
  const [tab, setTab] = useState<ApprovalStatus>('pending');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => normalizeUserProfile(d.data())));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = users.filter((u) => u.status === tab);

  async function setStatus(uid: string, status: ApprovalStatus, reason?: string) {
    setBusyId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        status,
        ...(reason !== undefined ? { rejectionReason: reason } : {}),
      });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAdmin(uid: string, isAdmin: boolean) {
    setBusyId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { isAdmin });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-sm border ${
              tab === t.value
                ? 'border-forest-600 bg-forest-600 text-cream'
                : 'border-ink/15 text-ink/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink/50 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-ink/50 text-sm">No {tab} accounts.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((u) => (
            <div key={u.uid} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{u.displayName}</p>
                <p className="text-sm text-ink/60">{u.email}</p>
                <p className="text-xs text-ink/40 mt-1">
                  {u.studentId && `ID: ${u.studentId} · `}
                  {u.programme && `${u.programme} · `}
                  {u.cohort}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {u.isAdmin && (
                  <span className="text-xs bg-gold-100 text-gold-600 px-2 py-1 rounded-sm font-medium">
                    Admin
                  </span>
                )}
                {tab === 'pending' && (
                  <>
                    <button
                      disabled={busyId === u.uid}
                      onClick={() => setStatus(u.uid, 'approved')}
                      className="btn-primary !px-3 !py-1.5 text-xs"
                    >
                      Approve
                    </button>
                    <button
                      disabled={busyId === u.uid}
                      onClick={() => setStatus(u.uid, 'rejected', 'Could not verify PAU status.')}
                      className="btn-secondary !px-3 !py-1.5 text-xs !border-clay-500 !text-clay-500"
                    >
                      Reject
                    </button>
                  </>
                )}
                {tab === 'approved' && (
                  <button
                    disabled={busyId === u.uid}
                    onClick={() => toggleAdmin(u.uid, !u.isAdmin)}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    {u.isAdmin ? 'Remove admin' : 'Make admin'}
                  </button>
                )}
                {tab === 'rejected' && (
                  <button
                    disabled={busyId === u.uid}
                    onClick={() => setStatus(u.uid, 'approved')}
                    className="btn-primary !px-3 !py-1.5 text-xs"
                  >
                    Approve anyway
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
