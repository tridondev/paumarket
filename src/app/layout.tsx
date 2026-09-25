import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { FavoritesProvider } from '@/lib/favorites-context';
import { AuthModalProvider } from '@/lib/auth-modal-context';
import { NotificationsProvider } from '@/lib/notifications-context';
import Navbar from '@/components/Navbar';
import CategoryRail from '@/components/CategoryRail';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'PAU Marketplace — Buy. Sell. Exchange. Connect.',
  description:
    'The digital marketplace for the Pan-African University student community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} font-sans bg-cream text-ink antialiased`}
      >
        <AuthProvider>
          <FavoritesProvider>
            <AuthModalProvider>
              <NotificationsProvider>
                <Navbar />
                <div className="border-b border-forest-600/10 bg-cream">
                  <CategoryRail compact />
                </div>
                <main className="min-h-[calc(100vh-64px)]">{children}</main>
                <footer className="border-t border-forest-600/10 py-10 mt-16 bg-forest-700 text-cream/70">
                  <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-2 text-sm">
                    <span className="font-display italic text-cream">PAU Marketplace</span>
                    <span>Buy. Sell. Exchange. Connect. — built by and for the PAU community.</span>
                  </div>
                </footer>
              </NotificationsProvider>
            </AuthModalProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
