'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { onSnapshot } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { conversationsForUserQuery } from '@/lib/messaging';
import { normalizeConversation } from '@/lib/timestamps';
import type { Conversation } from '@/types';

interface Toast {
  id: string;
  conversationId: string;
  senderName: string;
  message: string;
}

interface NotificationsContextValue {
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextValue>({ unreadCount: 0 });

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Tracks each conversation's last-seen "unread by me" state + message text
  // so we can tell a *new* incoming message apart from, e.g., this same
  // snapshot firing again after we mark something read ourselves.
  const prevRef = useRef<Map<string, { unread: boolean; lastMessage: string }>>(new Map());
  const isFirstSnapshot = useRef(true);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    // Ask permission for OS-level notifications once, quietly. If the
    // browser doesn't support it or the person dismisses it, we still have
    // the in-app toast + navbar badge as a fallback, so this is best-effort.
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!profile?.uid) {
      setUnreadCount(0);
      prevRef.current = new Map();
      isFirstSnapshot.current = true;
      return;
    }

    const unsub = onSnapshot(conversationsForUserQuery(profile.uid), (snap) => {
      const conversations: Conversation[] = snap.docs.map((d) => normalizeConversation(d.data(), d.id));
      const myId = profile.uid;

      setUnreadCount(conversations.filter((c) => c.unreadBy.includes(myId)).length);

      if (!isFirstSnapshot.current) {
        for (const c of conversations) {
          const prev = prevRef.current.get(c.id);
          const nowUnread = c.unreadBy.includes(myId);
          const isNewIncomingMessage =
            nowUnread && (!prev || !prev.unread || prev.lastMessage !== c.lastMessage);

          // Don't interrupt someone who's already looking at this thread.
          const alreadyViewingThread = pathnameRef.current === `/messages/${c.id}`;

          if (isNewIncomingMessage && c.lastMessage && !alreadyViewingThread) {
            const otherId = c.participantIds.find((id) => id !== myId) || '';
            const senderName = c.participantNames[otherId] || 'Someone';

            setToasts((t) => [
              ...t,
              { id: `${c.id}-${Date.now()}`, conversationId: c.id, senderName, message: c.lastMessage },
            ]);

            if (
              typeof document !== 'undefined' &&
              document.hidden &&
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                const n = new Notification(`New message from ${senderName}`, {
                  body: c.lastMessage,
                  tag: c.id,
                });
                n.onclick = () => {
                  window.focus();
                  router.push(`/messages/${c.id}`);
                };
              } catch {
                // Some browsers throw if notifications aren't fully supported
                // in the current context — safe to ignore, toast still shows.
              }
            }
          }
        }
      }

      prevRef.current = new Map(
        conversations.map((c) => [c.id, { unread: c.unreadBy.includes(myId), lastMessage: c.lastMessage }])
      );
      isFirstSnapshot.current = false;
    });

    return () => unsub();
  }, [profile?.uid, router]);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  return (
    <NotificationsContext.Provider value={{ unreadCount }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => (
          <MessageToast
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
            onOpen={() => {
              dismissToast(toast.id);
              router.push(`/messages/${toast.conversationId}`);
            }}
          />
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

function MessageToast({
  toast,
  onDismiss,
  onOpen,
}: {
  toast: Toast;
  onDismiss: () => void;
  onOpen: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card p-3.5 flex items-start gap-3 shadow-card-hover animate-fade-in-up">
      <span className="w-8 h-8 rounded-full bg-forest-600 text-cream text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
        {toast.senderName.charAt(0).toUpperCase()}
      </span>
      <button onClick={onOpen} className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-ink">New message from {toast.senderName}</p>
        <p className="text-xs text-ink/60 line-clamp-2 mt-0.5">{toast.message}</p>
      </button>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-ink/30 hover:text-ink/60 shrink-0 -mt-0.5 -mr-0.5 p-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
