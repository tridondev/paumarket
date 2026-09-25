'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function PendingApprovalPage() {
  const { user, profile, loading, signOutUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (profile?.status === 'approved') {
      router.replace('/');
    }
  }, [user, profile, loading, router]);

  const rejected = profile?.status === 'rejected';

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-forest-50 border border-forest-600/15 flex items-center justify-center mx-auto mb-5">
        {rejected ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="#b8541d"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#1b4332" strokeWidth="1.7" />
            <path d="M12 7v5l3.5 2" stroke="#1b4332" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <h1 className="font-display text-2xl mb-3">
        {rejected ? 'Verification not approved' : 'Your account is under review'}
      </h1>
      <p className="text-ink/60 text-sm leading-relaxed">
        {rejected
          ? profile?.rejectionReason ||
            'An admin was unable to verify your PAU status. Please contact the marketplace team.'
          : 'An admin needs to verify your PAU status before you can browse, sell, or message on the marketplace. This usually takes less than a day.'}
      </p>
      <button onClick={() => signOutUser()} className="btn-secondary mt-8">
        Sign out
      </button>
    </div>
  );
}
