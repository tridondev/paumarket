'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/types';
import { CATEGORY_IMAGES } from '@/lib/stock-images';

export default function CategoryRail({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const size = compact ? 44 : 56;

  return (
    <div className={`relative ${compact ? 'py-2' : 'py-3'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="shelf-track">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => router.push(`/?category=${encodeURIComponent(cat)}`)}
              className="category-pill group"
            >
              <span
                className="category-pill-icon overflow-hidden !p-0"
                style={{ width: size, height: size }}
              >
                <Image
                  src={CATEGORY_IMAGES[cat]}
                  alt=""
                  width={size}
                  height={size}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </span>
              <span className={`leading-tight text-ink/70 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
                {cat}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
