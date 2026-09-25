'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/**
 * Wrap any page that requires a signed-in user.
 * By default also requires the user's account to be admin-approved.
 * Pass requireApproval={false} for pages a pending user should still reach
 * (e.g. their own profile, so they can see their status and edit their
 * details while waiting) — everything else keeps the original behavior.
 * Redirects to /login (not signed in) or /pending-approval (not yet approved).
 */
export default function ProtectedRoute({
  children,
  requireApproval = true,
}: {
  children: React.ReactNode;
  requireApproval?: boolean;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const needsApprovalWait = requireApproval && !!profile && profile.status !== 'approved';

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (needsApprovalWait) {
      router.replace('/pending-approval');
    }
  }, [user, needsApprovalWait, loading, router]);

  if (loading || !user || !profile || needsApprovalWait) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center text-ink/50 text-sm">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
