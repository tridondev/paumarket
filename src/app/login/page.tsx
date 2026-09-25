'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: any) {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <h1 className="font-display text-3xl mb-2">Welcome back</h1>
      <p className="text-ink/60 text-sm mb-8">Log in to your PAU Marketplace account.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-clay-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        New here?{' '}
        <Link href="/signup" className="text-forest-600 font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
