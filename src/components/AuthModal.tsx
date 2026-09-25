'use client';

import Link from 'next/link';

export default function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/50 backdrop-blur-sm px-4 animate-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl mb-2">Sign In to Continue</h2>
        <p className="text-sm text-ink/60 mb-6 leading-relaxed">
          Create an account to contact sellers, save favourites, chat with vendors, and buy
          products on PAU Marketplace.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link href="/login" onClick={onClose} className="btn-primary w-full">
            Sign In
          </Link>
          <Link href="/signup" onClick={onClose} className="btn-secondary w-full">
            Create Account
          </Link>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-ink/40 mt-4 hover:text-ink/60 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
