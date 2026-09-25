'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !profile) {
      router.replace('/login');
      return;
    }
    if (!profile.isAdmin) {
      router.replace('/');
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile || !profile.isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center text-ink/50 text-sm">
        Checking admin access…
      </div>
    );
  }

  return <>{children}</>;
}
