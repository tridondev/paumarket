'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import AuthModal from '@/components/AuthModal';

interface AuthModalContextValue {
  openAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  openAuthModal: () => {},
});

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AuthModalContext.Provider value={{ openAuthModal: () => setOpen(true) }}>
      {children}
      <AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </AuthModalContext.Provider>
  );
}
