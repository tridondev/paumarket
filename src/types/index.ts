export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ListingSection = 'shop' | 'exchange' | 'leaving-pau';

export type ListingCondition = 'new' | 'used' | 'like-new' | 'free' | 'wanted';

export const CATEGORIES = [
  'Fashion & Clothing',
  'Shoes & Bags',
  'Cosmetics & Beauty',
  'Food & Snacks',
  'Electronics',
  'Phone Accessories',
  'Books & Academic Materials',
  'Printing & Design Services',
  'Hair & Barbing Services',
  'Photography',
  'Digital Services',
  'Handmade Products',
  'Furniture',
  'Kitchen & Appliances',
  'Housing & Accommodation',
  'Jobs & Gigs',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  status: ApprovalStatus;
  isAdmin: boolean;
  studentId?: string;
  programme?: string;
  cohort?: string; // e.g. "GCI Class of 2027"
  bio?: string;
  storeName?: string;
  createdAt: number;
  rejectionReason?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhotoURL?: string;
  title: string;
  description: string;
  price: number; // 0 for "free"
  currency: string; // default 'EUR'
  category: Category;
  condition: ListingCondition;
  section: ListingSection;
  images: string[];
  location: string; // e.g. "Student Centre", "Hostel Block C"
  locationLat?: number;
  locationLng?: number;
  deliveryAvailable: boolean;
  cohort?: string; // used for Leaving PAU listings
  status: 'active' | 'sold' | 'removed';
  createdAt: number;
  updatedAt: number;
  views: number;
}

// Public-safe mirror of a UserProfile, readable by anyone (signed in or not)
// so store pages work for guests. Never holds email, phone, or matric number.
export interface StoreProfile {
  uid: string;
  displayName: string;
  storeName?: string;
  bio?: string;
  photoURL?: string;
  joinedAt: number;
}

export interface Favorite {
  id: string; // `${uid}_${listingId}`
  uid: string;
  listingId: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: number;
  unreadBy: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}
