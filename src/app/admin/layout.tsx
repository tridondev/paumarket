'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminRoute from '@/components/AdminRoute';

const TABS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'User approvals' },
  { href: '/admin/listings', label: 'Listings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminRoute>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-clay-500 text-sm font-medium mb-1">Admin</p>
        <h1 className="font-display text-3xl mb-6">Marketplace control room</h1>
        <div className="flex gap-1 border-b border-ink/10 mb-8">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                pathname === tab.href
                  ? 'border-forest-600 text-forest-600'
                  : 'border-transparent text-ink/50 hover:text-ink/80'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </AdminRoute>
  );
}
