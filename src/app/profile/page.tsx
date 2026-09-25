'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { uploadAvatarImage } from '@/lib/listings';

const STATUS_COPY: Record<string, { label: string; className: string; note: string }> = {
  approved: {
    label: 'Verified',
    className: 'bg-forest-50 text-forest-600 border-forest-600/20',
    note: 'Your account is verified — you can post listings, message members, and run a student store.',
  },
  pending: {
    label: 'Pending verification',
    className: 'bg-gold-50 text-gold-600 border-gold-500/30',
    note: 'You can already browse, buy, and message sellers while you wait. An admin needs to verify your account before you can post your own listings.',
  },
  rejected: {
    label: 'Not verified',
    className: 'bg-clay-500/10 text-clay-600 border-clay-500/30',
    note: 'Your verification request wasn\u2019t approved, so you can\u2019t post listings yet. Reach out to an admin if you think this was a mistake.',
  },
};

function formatMemberSince(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function ProfileForm() {
  const { user, profile, updateUserProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [studentId, setStudentId] = useState(profile?.studentId || '');
  const [programme, setProgramme] = useState(profile?.programme || '');
  const [cohort, setCohort] = useState(profile?.cohort || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!profile || !user) return null;

  const status = STATUS_COPY[profile.status] || STATUS_COPY.pending;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    setError('');
    try {
      const url = await uploadAvatarImage(file, user.uid);
      await updateUserProfile({ photoURL: url });
    } catch (err: any) {
      setError(err?.message || 'Could not update your photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        studentId: studentId.trim(),
        programme: programme.trim(),
        cohort: cohort.trim(),
      });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-8">Your profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-forest-100 text-forest-600 text-2xl font-semibold flex items-center justify-center overflow-hidden">
              {profile.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.displayName?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-forest-600 text-cream flex items-center justify-center cursor-pointer hover:bg-forest-700 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
              {uploadingAvatar ? (
                <span className="w-3 h-3 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 15V6a2 2 0 0 1 2-2h2l1.5-2h5L16 4h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="11" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl">{profile.displayName}</h2>
            <p className="text-sm text-ink/50 mt-0.5 truncate">{profile.email}</p>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-pill px-2.5 py-1 mt-3 ${status.className}`}
            >
              {status.label}
            </span>
            <p className="text-xs text-ink/40 mt-2">Member since {formatMemberSince(profile.createdAt)}</p>
          </div>
        </div>

        <p className="text-sm text-ink/60 leading-relaxed mt-5 pt-5 border-t border-ink/5">
          {status.note}
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg">Account details</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary !px-3.5 !py-1.5 text-xs">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Student ID</label>
                <input className="field" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              </div>
              <div>
                <label className="label">Programme</label>
                <input className="field" value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="GCI, GEE…" />
              </div>
            </div>
            <div>
              <label className="label">Cohort / graduation year</label>
              <input className="field" value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="e.g. GCI Class of 2027" />
            </div>

            {error && <p className="text-clay-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDisplayName(profile.displayName || '');
                  setStudentId(profile.studentId || '');
                  setProgramme(profile.programme || '');
                  setCohort(profile.cohort || '');
                  setError('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
            <dt className="text-ink/50">Student ID</dt>
            <dd className="text-ink">{profile.studentId || '—'}</dd>
            <dt className="text-ink/50">Programme</dt>
            <dd className="text-ink">{profile.programme || '—'}</dd>
            <dt className="text-ink/50">Cohort</dt>
            <dd className="text-ink">{profile.cohort || '—'}</dd>
          </dl>
        )}

        {saved && <p className="text-forest-600 text-sm mt-4">Saved.</p>}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/store/${profile.uid}`} className="btn-secondary">
          Manage my store
        </Link>
        <Link href="/messages" className="btn-secondary">
          My messages
        </Link>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireApproval={false}>
      <ProfileForm />
    </ProtectedRoute>
  );
}
