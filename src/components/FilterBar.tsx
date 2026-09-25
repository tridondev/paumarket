'use client';

import { CATEGORIES, type ListingCondition } from '@/types';

const CONDITIONS: { value: ListingCondition | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'like-new', label: 'Like New' },
  { value: 'free', label: 'Free' },
  { value: 'wanted', label: 'Wanted' },
];

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  condition: string;
  onConditionChange: (v: string) => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  condition,
  onConditionChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search laptop, jacket, mini fridge, printing…"
          className="field sm:flex-1"
        />
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="field sm:w-56"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {CONDITIONS.map((c) => {
          const active = condition === c.value || (c.value === 'all' && !condition);
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onConditionChange(c.value === 'all' ? '' : c.value)}
              className={`rounded-pill px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                active
                  ? 'bg-forest-600 border-forest-600 text-cream'
                  : 'border-ink/15 text-ink/60 hover:border-forest-500/50 hover:text-forest-600'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
