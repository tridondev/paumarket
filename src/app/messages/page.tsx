'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { conversationsForUserQuery } from '@/lib/messaging';
import { normalizeConversation } from '@/lib/timestamps';
import type { Conversation } from '@/types';

function MessagesInbox() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const unsub = onSnapshot(conversationsForUserQuery(profile.uid), (snap) => {
      setConversations(snap.docs.map((d) => normalizeConversation(d.data(), d.id)));
      setLoading(false);
    });
    return () => unsub();
  }, [profile]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-8">Messages</h1>

      {loading ? (
        <p className="text-ink/50 text-sm">Loading conversations…</p>
      ) : conversations.length === 0 ? (
        <p className="text-ink/50 text-sm">
          No conversations yet. Contact a seller from any listing to start one.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-ink/10 border border-ink/10 rounded">
          {conversations.map((c) => {
            const otherId = c.participantIds.find((id) => id !== profile?.uid) || '';
            const otherName = c.participantNames[otherId] || 'Unknown';
            const unread = profile ? c.unreadBy.includes(profile.uid) : false;
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-forest-50/50 transition-colors"
              >
                <div>
                  <p className={`text-sm ${unread ? 'font-semibold' : 'font-medium'} text-ink`}>
                    {otherName}
                  </p>
                  <p className="text-xs text-ink/50 line-clamp-1">
                    {c.listingTitle} — {c.lastMessage || 'Say hello'}
                  </p>
                </div>
                {unread && <span className="w-2 h-2 rounded-full bg-clay-500 shrink-0" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesInbox />
    </ProtectedRoute>
  );
}
