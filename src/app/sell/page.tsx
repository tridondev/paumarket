'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { createListing, uploadListingImage } from '@/lib/listings';
import { CATEGORIES, type ListingCondition, type ListingSection } from '@/types';

const LocationPicker = dynamic(
  () => import('@/components/LocationMap').then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-56 rounded border border-ink/15 bg-forest-50 animate-pulse" /> }
);

function SellForm() {
  const { profile } = useAuth();
  const router = useRouter();

  const [section, setSection] = useState<ListingSection>('shop');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(CATEGORIES[0]);
  const [condition, setCondition] = useState<ListingCondition>('new');
  const [location, setLocation] = useState('');
  const [locationLat, setLocationLat] = useState<number | undefined>(undefined);
  const [locationLng, setLocationLng] = useState<number | undefined>(undefined);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [cohort, setCohort] = useState(profile?.cohort || '');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError('');

    if (files.length === 0) {
      setError('Add at least one photo so buyers can see what you\u2019re listing.');
      return;
    }

    setSubmitting(true);
    try {
      const images = await Promise.all(
        files.map((f) => uploadListingImage(f, profile.uid))
      );

      await createListing({
        sellerId: profile.uid,
        sellerName: profile.storeName || profile.displayName,
        sellerPhotoURL: profile.photoURL || '',
        title,
        description,
        price: condition === 'free' || condition === 'wanted' ? 0 : Number(price) || 0,
        currency: 'EUR',
        category,
        condition,
        section,
        images,
        location,
        locationLat,
        locationLng,
        deliveryAvailable,
        cohort: section === 'leaving-pau' ? cohort : '',
      });
      router.push(`/store/${profile.uid}`);
    } catch (err: any) {
      setError(err?.message || 'Could not publish your listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-2">List an item or service</h1>
      <p className="text-ink/60 text-sm mb-8">
        Your listing goes live instantly and is visible to every verified PAU member.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="label">Where should this appear?</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['shop', 'Shop / Store'],
                ['exchange', 'PAU Exchange'],
                ['leaving-pau', 'Leaving PAU'],
              ] as [ListingSection, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSection(value)}
                className={`rounded border px-3 py-2.5 text-sm font-medium transition-colors ${
                  section === value
                    ? 'border-forest-600 bg-forest-50 text-forest-600'
                    : 'border-ink/15 text-ink/60 hover:border-ink/30'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {section === 'leaving-pau' && (
          <div>
            <label className="label">Cohort (e.g. "GCI Class of 2027")</label>
            <input className="field" value={cohort} onChange={(e) => setCohort(e.target.value)} required />
          </div>
        )}

        <div>
          <label className="label">Title</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="field min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="field" value={category} onChange={(e) => setCategory(e.target.value as any)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select
              className="field"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ListingCondition)}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="like-new">Like New</option>
              <option value="free">Free</option>
              <option value="wanted">Wanted</option>
            </select>
          </div>
        </div>

        {condition !== 'free' && condition !== 'wanted' && (
          <div>
            <label className="label">Price (EUR)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="field"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="label">Meeting point / location</label>
          <input
            className="field"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Student Centre, Hostel Block C"
            required
          />
          <p className="text-xs text-ink/40 mt-1.5 mb-2">
            Optional: drop a pin so buyers can see exactly where to meet you.
          </p>
          <LocationPicker
            lat={locationLat}
            lng={locationLng}
            onChange={(lat, lng) => {
              setLocationLat(lat);
              setLocationLng(lng);
            }}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={deliveryAvailable}
            onChange={(e) => setDeliveryAvailable(e.target.checked)}
            className="rounded border-ink/30"
          />
          Delivery available on campus
        </label>

        <div>
          <label className="label">Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="field !py-2"
          />
          {files.length > 0 && (
            <p className="text-xs text-ink/50 mt-1">{files.length} photo(s) selected</p>
          )}
          <p className="text-xs text-ink/40 mt-1">
            Photos are automatically compressed before upload, so large phone photos won&rsquo;t
            slow down your listing.
          </p>
        </div>

        {error && <p className="text-clay-500 text-sm">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary mt-2">
          {submitting ? 'Compressing & uploading photos…' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}

export default function SellPage() {
  return (
    <ProtectedRoute>
      <SellForm />
    </ProtectedRoute>
  );
}
