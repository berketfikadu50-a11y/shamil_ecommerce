'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowUpDown, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { ADDIS, CATEGORIES, FUELS, MAKES, OTHER_CITIES, TRANSMISSIONS, type Listing } from '@/lib/data';
import { useFakeLoad, useStore } from '@/lib/store';
import { CAT_ICON, Empty, Grid, Sheet } from '@/components/ui';

const EMPTY = { city: '', min: '', max: '', yearFrom: '', yearTo: '', make: '', trans: '', fuel: '' };
type F = typeof EMPTY;

const SORTS = ['Newest', 'Price: low to high', 'Price: high to low', 'Year: newest', 'Mileage: lowest'];

function apply(items: Listing[], f: F, sort: string) {
  const num = (s: string) => (s ? Number(s) : null);
  const out = items.filter((l) => {
    if (f.city === 'addis' ? !ADDIS.includes(l.city) : f.city && l.city !== f.city) return false;
    if (num(f.min) != null && l.price < num(f.min)!) return false;
    if (num(f.max) != null && l.price > num(f.max)!) return false;
    if (num(f.yearFrom) != null && (l.year ?? 0) < num(f.yearFrom)!) return false;
    if (num(f.yearTo) != null && (l.year ?? 9999) > num(f.yearTo)!) return false;
    if (f.make && l.make !== f.make) return false;
    if (f.trans && l.trans !== f.trans) return false;
    if (f.fuel && l.fuel !== f.fuel) return false;
    return true;
  });
  const boost = (l: Listing) => (l.promoted || l.featured ? 0 : 1);
  switch (sort) {
    case 'Price: low to high':
      return out.sort((a, b) => a.price - b.price);
    case 'Price: high to low':
      return out.sort((a, b) => b.price - a.price);
    case 'Year: newest':
      return out.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case 'Mileage: lowest':
      return out.sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
    default:
      // Paid placements float to the top of the default order.
      return out.sort((a, b) => boost(a) - boost(b) || a.daysAgo - b.daysAgo);
  }
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, listings } = useStore();
  const cat = CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
  const isVehicles = cat.slug === 'vehicles';
  const Icon = CAT_ICON[cat.slug];

  const [f, setF] = useState<F>(EMPTY);
  const [draft, setDraft] = useState<F>(EMPTY);
  const [sort, setSort] = useState(SORTS[0]);
  const [open, setOpen] = useState(false);

  const base = useMemo(() => listings.filter((l) => l.cat === cat.slug && l.status === 'active'), [listings, cat.slug]);
  const results = useMemo(() => apply(base, f, sort), [base, f, sort]);
  const draftCount = useMemo(() => apply(base, draft, sort).length, [base, draft, sort]);
  const loading = useFakeLoad(JSON.stringify(f) + sort + cat.slug, 400);
  const activeCount = Object.values(f).filter(Boolean).length;

  const quick: { label: string; key: keyof F; value: string }[] = isVehicles
    ? [
        { label: 'Addis Ababa', key: 'city', value: 'addis' },
        { label: 'Automatic', key: 'trans', value: 'Automatic' },
        { label: 'Under 3M ETB', key: 'max', value: '3000000' },
        { label: 'Toyota', key: 'make', value: 'Toyota' },
        { label: '2018 or newer', key: 'yearFrom', value: '2018' },
        { label: 'Electric', key: 'fuel', value: 'Electric' },
      ]
    : [
        { label: 'Addis Ababa', key: 'city', value: 'addis' },
        ...OTHER_CITIES.map((c) => ({ label: c, key: 'city' as const, value: c })),
      ];

  const set = (k: keyof F, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const options = (list: string[]) => (
    <>
      <option value="">{t('Any')}</option>
      {list.map((o) => (
        <option key={o} value={o}>
          {t(o)}
        </option>
      ))}
    </>
  );

  return (
    <div className="pt-5">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon size={24} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{t(cat.name)}</h1>
          <p className="text-sm text-ink/55">{t('{n} results', { n: results.length })}</p>
        </div>
      </div>

      <div className="no-scrollbar sticky top-16 z-30 -mx-4 mt-4 flex gap-2 overflow-x-auto bg-white/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          className={`chip ${activeCount ? 'chip-on' : ''}`}
          onClick={() => {
            setDraft(f);
            setOpen(true);
          }}
        >
          <SlidersHorizontal size={15} /> {t('Filters')}
          {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-bold text-brand-700">{activeCount}</span>}
        </button>
        {quick.map((c) => {
          const on = f[c.key] === c.value;
          return (
            <button
              key={c.label}
              type="button"
              aria-pressed={on}
              className={`chip ${on ? 'chip-on' : ''}`}
              onClick={() => setF((s) => ({ ...s, [c.key]: on ? '' : c.value }))}
            >
              {t(c.label)}
              {on && <X size={14} />}
            </button>
          );
        })}
      </div>

      <div className="mb-4 mt-1 flex items-center justify-end">
        <label className="flex items-center gap-2 text-sm text-ink/60">
          <ArrowUpDown size={15} />
          <span className="sr-only">{t('Sort by')}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-full border border-line bg-white px-3 !text-sm font-semibold text-ink focus:outline-none"
          >
            {SORTS.filter((s) => isVehicles || !/Year|Mileage/.test(s)).map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!loading && results.length === 0 ? (
        <Empty icon={SearchX} title={t('No listings match')} hint={t('Remove a filter or try a different word.')}>
          {activeCount > 0 && (
            <button type="button" className="btn-soft" onClick={() => setF(EMPTY)}>
              {t('Clear filters')}
            </button>
          )}
        </Empty>
      ) : (
        <Grid items={results} loading={loading} />
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t('Filters')}
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-outline" onClick={() => setDraft(EMPTY)}>
              {t('Clear all')}
            </button>
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() => {
                setF(draft);
                setOpen(false);
              }}
            >
              {t('Show {n} results', { n: draftCount })}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="f-city">{t('City or sub-city')}</label>
            <select id="f-city" className="input" value={draft.city} onChange={(e) => set('city', e.target.value)}>
              <option value="">{t('Anywhere in Ethiopia')}</option>
              <option value="addis">{t('All of Addis Ababa')}</option>
              <optgroup label={t('Addis Ababa sub-cities')}>
                {ADDIS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
              <optgroup label={t('Other cities')}>
                {OTHER_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <span className="label">{t('Price range (ETB)')}</span>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" inputMode="numeric" placeholder={t('Min')} aria-label={t('Min')} value={draft.min} onChange={(e) => set('min', e.target.value.replace(/\D/g, ''))} />
              <input className="input" inputMode="numeric" placeholder={t('Max')} aria-label={t('Max')} value={draft.max} onChange={(e) => set('max', e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>

          {isVehicles && (
            <>
              <div>
                <span className="label">{t('Year')}</span>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" inputMode="numeric" maxLength={4} placeholder={t('From')} aria-label={t('From')} value={draft.yearFrom} onChange={(e) => set('yearFrom', e.target.value.replace(/\D/g, ''))} />
                  <input className="input" inputMode="numeric" maxLength={4} placeholder={t('To')} aria-label={t('To')} value={draft.yearTo} onChange={(e) => set('yearTo', e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="f-make">{t('Make')}</label>
                <select id="f-make" className="input" value={draft.make} onChange={(e) => set('make', e.target.value)}>
                  {options(MAKES)}
                </select>
              </div>
              {(
                [
                  ['Transmission', 'trans', TRANSMISSIONS],
                  ['Fuel', 'fuel', FUELS],
                ] as const
              ).map(([label, key, list]) => (
                <div key={key}>
                  <span className="label">{t(label)}</span>
                  <div className="flex flex-wrap gap-2">
                    {['', ...list].map((o) => (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={draft[key] === o}
                        className={`chip ${draft[key] === o ? 'chip-on' : ''}`}
                        onClick={() => set(key, o)}
                      >
                        {t(o || 'Any')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Sheet>
    </div>
  );
}
