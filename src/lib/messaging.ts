import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeChatMessage } from '@/lib/timestamps';

const CONVERSATIONS_COL = 'conversations';

/**
 * Deterministic conversation id so the same buyer+seller+listing thread is reused
 * instead of creating duplicates.
 */
function conversationId(listingId: string, userA: string, userB: string) {
  const [a, b] = [userA, userB].sort();
  return `${listingId}_${a}_${b}`;
}

export async function getOrCreateConversation(params: {
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
}) {
  const { listingId, listingTitle, buyerId, buyerName, sellerId, sellerName } = params;
  const id = conversationId(listingId, buyerId, sellerId);
  const ref = doc(db, CONVERSATIONS_COL, id);

  await setDoc(
    ref,
    {
      listingId,
      listingTitle,
      participantIds: [buyerId, sellerId],
      participantNames: { [buyerId]: buyerName, [sellerId]: sellerName },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      unreadBy: [],
    },
    { merge: true }
  );

  return id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  text: string
) {
  const messagesRef = collection(db, CONVERSATIONS_COL, conversationId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    unreadBy: arrayUnion(recipientId),
  });
}

export async function markConversationRead(conversationId: string, userId: string) {
  await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
    unreadBy: arrayRemove(userId),
  });
}

export function conversationsForUserQuery(userId: string) {
  return query(
    collection(db, CONVERSATIONS_COL),
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
}

export function messagesQuery(conversationId: string) {
  return query(
    collection(db, CONVERSATIONS_COL, conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
}

export async function getConversationMessagesOnce(conversationId: string) {
  const snap = await getDocs(messagesQuery(conversationId));
  return snap.docs.map((d) => normalizeChatMessage(d.data(), d.id));
}
