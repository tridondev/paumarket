'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/notifications-context';

const NAV_LINKS = [
  { href: '/', label: 'Shop' },
  { href: '/exchange', label: 'Exchange' },
  { href: '/leaving-pau', label: 'Leaving PAU' },
];

export default function Navbar() {
  const { user, profile, signOutUser } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  async function handleSignOut() {
    await signOutUser();
    router.push('/');
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
  }

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      {/* Utility bar — trust signal, thin, like a marketplace's top strip */}
      <div className="bg-forest-700 text-cream/80 text-xs">
        <div className="max-w-6xl mx-auto px-4 h-8 flex items-center justify-between">
          <span>Verified Pan-African University members only</span>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/leaving-pau" className="hover:text-cream transition-colors">
              Leaving PAU sales
            </Link>
            <Link href="/sell" className="hover:text-cream transition-colors">
              Start a student store
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-forest-600/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-baseline gap-1.5 shrink-0">
            <span className="font-display italic text-xl font-semibold text-forest-600">
              PAU
            </span>
            <span className="font-display text-xl text-ink hidden sm:inline">Marketplace</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 shrink-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === link.href
                    ? 'text-forest-600'
                    : 'text-ink/70 hover:text-forest-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search — the centerpiece, Amazon-style */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0">
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search laptop, jacket, mini fridge, printing…"
                className="field !pl-9 !py-2 !rounded-pill"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            {user && profile ? (
              <>
                <Link
                  href="/messages"
                  className="relative text-sm font-medium text-ink/70 hover:text-forest-600 whitespace-nowrap"
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[16px] h-4 px-1 rounded-full bg-clay-500 text-cream text-[10px] font-semibold flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/favorites"
                  className="text-sm font-medium text-ink/70 hover:text-forest-600 whitespace-nowrap"
                >
                  Favourites
                </Link>
                {profile.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-clay-500 hover:text-clay-600 whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href={`/store/${profile.uid}`}
                  className="text-sm font-medium text-ink/70 hover:text-forest-600 whitespace-nowrap"
                >
                  My store
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-forest-600 whitespace-nowrap"
                >
                  <span className="w-6 h-6 rounded-full bg-forest-100 text-forest-600 text-[10px] font-semibold flex items-center justify-center overflow-hidden shrink-0">
                    {profile.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.displayName?.charAt(0).toUpperCase() || '?'
                    )}
                  </span>
                  Profile
                </Link>
                <button onClick={handleSignOut} className="btn-secondary !px-4 !py-2 whitespace-nowrap">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-ink/70 hover:text-forest-600 whitespace-nowrap">
                  Log in
                </Link>
                <Link href="/signup" className="btn-gold !px-4 !py-2 whitespace-nowrap">
                  Join
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-ink shrink-0"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-forest-600/10 px-4 py-4 flex flex-col gap-3 bg-cream">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm font-medium text-ink/80">
              {link.label}
            </Link>
          ))}
          {user && profile ? (
            <>
              <Link href="/messages" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-ink/80">
                Messages
                {unreadCount > 0 && (
                  <span className="min-w-[16px] h-4 px-1 rounded-full bg-clay-500 text-cream text-[10px] font-semibold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/favorites" onClick={() => setOpen(false)} className="text-sm font-medium text-ink/80">
                Favourites
              </Link>
              <Link href={`/store/${profile.uid}`} onClick={() => setOpen(false)} className="text-sm font-medium text-ink/80">
                My store
              </Link>
              <Link href="/profile" onClick={() => setOpen(false)} className="text-sm font-medium text-ink/80">
                Profile
              </Link>
              {profile.isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} className="text-sm font-medium text-clay-500">
                  Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="btn-secondary self-start !px-4 !py-2">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-ink/80">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="btn-gold self-start !px-4 !py-2">
                Join PAU Marketplace
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
