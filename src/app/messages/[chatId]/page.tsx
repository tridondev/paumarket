'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { markConversationRead, messagesQuery, sendMessage } from '@/lib/messaging';
import { normalizeChatMessage, normalizeConversation } from '@/lib/timestamps';
import type { ChatMessage, Conversation } from '@/types';

function ChatThread() {
  const params = useParams<{ chatId: string }>();
  const { profile } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params?.chatId) return;
    getDoc(doc(db, 'conversations', params.chatId)).then((snap) => {
      if (snap.exists()) setConversation(normalizeConversation(snap.data(), snap.id));
    });
  }, [params?.chatId]);

  useEffect(() => {
    if (!params?.chatId) return;
    const unsub = onSnapshot(messagesQuery(params.chatId), (snap) => {
      setMessages(snap.docs.map((d) => normalizeChatMessage(d.data(), d.id)));
    });
    return () => unsub();
  }, [params?.chatId]);

  useEffect(() => {
    if (params?.chatId && profile) {
      markConversationRead(params.chatId, profile.uid).catch(() => {});
    }
  }, [params?.chatId, profile, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !profile || !conversation || !params?.chatId) return;
    const recipientId = conversation.participantIds.find((id) => id !== profile.uid);
    if (!recipientId) return;
    setSending(true);
    try {
      await sendMessage(params.chatId, profile.uid, recipientId, text.trim());
      setText('');
    } finally {
      setSending(false);
    }
  }

  if (!conversation) {
    return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-ink/50">Loading conversation…</div>;
  }

  const otherId = conversation.participantIds.find((id) => id !== profile?.uid) || '';
  const otherName = conversation.participantNames[otherId] || 'Unknown';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-64px)]">
      <div className="border-b border-ink/10 pb-4 mb-4">
        <Link href="/messages" className="text-xs text-ink/50">&larr; Back to messages</Link>
        <h1 className="font-display text-2xl mt-1">{otherName}</h1>
        <Link href={`/listing/${conversation.listingId}`} className="text-sm text-forest-600">
          Re: {conversation.listingTitle}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4">
        {messages.map((m) => {
          const mine = m.senderId === profile?.uid;
          return (
            <div
              key={m.id}
              className={`max-w-[75%] rounded px-3.5 py-2 text-sm ${
                mine ? 'self-end bg-forest-600 text-cream' : 'self-start bg-forest-50 text-ink'
              }`}
            >
              {m.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-ink/10">
        <input
          className="field flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
        />
        <button type="submit" disabled={sending} className="btn-primary !px-5">
          Send
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatThread />
    </ProtectedRoute>
  );
}
