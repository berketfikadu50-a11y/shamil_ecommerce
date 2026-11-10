'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/data';
import { useStore } from '@/lib/store';
import { CAT_ICON } from '@/components/ui';

export default function CategoriesPage() {
  const { t, listings, toast } = useStore();
  const [hidden, setHidden] = useState<string[]>([]);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        {t('Categories')} <span className="text-ink/40">{CATEGORIES.length}</span>
      </h1>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {CATEGORIES.map((c) => {
          const Icon = CAT_ICON[c.slug];
          const on = !hidden.includes(c.slug);
          const n = listings.filter((l) => l.cat === c.slug && l.status === 'active').length;
          return (
            <li key={c.slug} className="card flex items-center gap-3 p-4">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${on ? 'bg-brand-50 text-brand-700' : 'bg-mist text-ink/40'}`}>
                <Icon size={22} />
              </span>
              <div className="flex-1">
                <p className="font-semibold">{t(c.name)}</p>
                <p className="text-sm text-ink/55">
                  {t('{n} ads', { n })}, {t(on ? 'Visible' : 'Hidden')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={t(c.name)}
                onClick={() => {
                  setHidden(on ? [...hidden, c.slug] : hidden.filter((s) => s !== c.slug));
                  toast(t(on ? 'Category hidden from the home page' : 'Category shown on the home page'));
                }}
                className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-brand-600' : 'bg-line'}`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
