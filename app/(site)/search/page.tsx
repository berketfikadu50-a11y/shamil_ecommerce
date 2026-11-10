'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';
import { useFakeLoad, useStore } from '@/lib/store';
import { Empty, Grid } from '@/components/ui';

const POPULAR = ['Vitz', 'Corolla', 'RAV4', 'iPhone', 'Apartment', 'Samsung', 'Hilux'];

function SearchScreen() {
  const { t, listings } = useStore();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [cat, setCat] = useState('');
  const loading = useFakeLoad(q + cat, 350);

  const term = q.trim().toLowerCase();
  const results = listings
    .filter((l) => l.status === 'active')
    .filter((l) => !cat || l.cat === cat)
    .filter((l) => !term || l.title.toLowerCase().includes(term))
    .sort((a, b) => Number(!!b.promoted) - Number(!!a.promoted) || a.daysAgo - b.daysAgo);

  return (
    <div className="pt-5">
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 shadow-card focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
        <Search size={20} className="shrink-0 text-ink/40" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('Search by title, for example "Vitz" or "iPhone"')}
          aria-label={t('Search')}
          className="h-14 min-w-0 flex-1 bg-transparent placeholder:text-ink/40 focus:outline-none"
        />
        {q && (
          <button type="button" aria-label="Clear" onClick={() => setQ('')} className="grid h-8 w-8 place-items-center rounded-full bg-mist">
            <X size={15} />
          </button>
        )}
      </div>

      {!term && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-ink/60">{t('Popular searches')}</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <button key={p} type="button" className="chip" onClick={() => setQ(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button type="button" className={`chip ${cat === '' ? 'chip-on' : ''}`} onClick={() => setCat('')}>
          {t('All')}
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.slug} type="button" className={`chip ${cat === c.slug ? 'chip-on' : ''}`} onClick={() => setCat(c.slug)}>
            {t(c.name)}
          </button>
        ))}
      </div>

      <p className="mb-3 mt-4 text-sm text-ink/55">{t('{n} results', { n: results.length })}</p>

      {!loading && results.length === 0 ? (
        <Empty icon={SearchX} title={t('No listings match')} hint={t('Remove a filter or try a different word.')}>
          <button
            type="button"
            className="btn-soft"
            onClick={() => {
              setQ('');
              setCat('');
            }}
          >
            {t('Clear filters')}
          </button>
        </Empty>
      ) : (
        <Grid items={results} loading={loading} />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchScreen />
    </Suspense>
  );
}
