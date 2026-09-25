'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [programme, setProgramme] = useState('');
  const [cohort, setCohort] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email, password, { studentId, programme, cohort });
      router.push('/pending-approval');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <h1 className="font-display text-3xl mb-2">Join PAU Marketplace</h1>
      <p className="text-ink/60 text-sm mb-8">
        Sign up, add your Student ID so we can confirm you're PAU. An admin will
        review and approve your account before you can buy, sell, or message.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label">Full name</label>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@email.com"
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
            minLength={6}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Student ID (optional)</label>
            <input className="field" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          </div>
          <div>
            <label className="label">Programme (optional)</label>
            <input className="field" value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="GCI, GEE…" />
          </div>
        </div>
        <div>
          <label className="label">Cohort / graduation year (optional)</label>
          <input
            className="field"
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
            placeholder="e.g. GCI Class of 2027"
          />
        </div>

        {error && <p className="text-clay-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-forest-600 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
