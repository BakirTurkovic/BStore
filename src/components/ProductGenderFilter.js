'use client';

import { PRODUCT_GENDER_LABELS } from '../lib/productGender.js';

const FILTERS = [
  { value: 'ALL', label: 'Sve' },
  { value: 'WOMEN', label: PRODUCT_GENDER_LABELS.WOMEN },
  { value: 'MEN', label: PRODUCT_GENDER_LABELS.MEN },
  { value: 'UNISEX', label: PRODUCT_GENDER_LABELS.UNISEX },
];

export default function ProductGenderFilter({ value, onChange }) {
  return (
    <nav aria-label="Filtriraj proizvode po spolu" className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          type="button"
          key={filter.value}
          onClick={() => onChange(filter.value)}
          aria-pressed={value === filter.value}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            value === filter.value
              ? 'border-indigo-400/50 bg-indigo-400/15 text-white'
              : 'border-white/10 bg-zinc-900/70 text-zinc-400 hover:border-white/20 hover:text-white'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </nav>
  );
}
