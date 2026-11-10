'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';
import { useFakeLoad, useStore } from '@/lib/store';
import { CAT_ICON, CardSkeleton, Grid, ListingCard } from '@/components/ui';

export default function HomePage() {
  const { t, listings } = useStore();
  const router = useRouter();
  const [q, setQ] = useState('');
  const loading = useFakeLoad('home');

  const active = listings.filter((l) => l.status === 'active');
  const featured = active.filter((l) => l.featured);
  const latest = [...active].sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 12);

  return (
    <div className="space-y-8 pt-4">
      <section className="relative overflow-hidden rounded-[28px] bg-brand-700 px-5 pb-6 pt-7 text-white md:px-12 md:pb-12 md:pt-14">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-500/50" />
        <div className="pointer-events-none absolute -bottom-24 right-24 hidden h-56 w-56 rounded-full bg-sun-400/25 md:block" />
        <div className="relative max-w-2xl">
          <h1 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            {t('Buy and sell anything, anywhere in Ethiopia')}
          </h1>
          <p className="mt-2 text-sm text-white/75 md:mt-4 md:text-base">
            {t('Cars, homes, phones and more from people and dealers near you.')}
          </p>
          <form
            className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-lift md:mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <Search size={20} className="ml-3 shrink-0 text-ink/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('Search cars, phones, homes')}
              aria-label={t('Search')}
              className="h-11 min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <button type="submit" className="btn-primary !h-11 !rounded-xl !px-4">
              {t('Search')}
            </button>
          </form>
        </div>
      </section>

      <section aria-label={t('Categories')}>
        <div className="grid grid-cols-4 gap-2.5 md:grid-cols-8 md:gap-4">
          {CATEGORIES.map((c) => {
            const Icon = CAT_ICON[c.slug];
            const n = active.filter((l) => l.cat === c.slug).length;
            return (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl p-2 text-center transition hover:bg-mist"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon size={26} strokeWidth={1.8} />
                </span>
                <span className="text-xs font-semibold leading-tight">{t(c.name)}</span>
                <span className="-mt-1.5 hidden text-[11px] text-ink/45 md:block">{t('{n} ads', { n })}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="h-section">{t('Featured')}</h2>
          <Link href="/category/vehicles" className="flex items-center text-sm font-semibold text-brand-700">
            {t('See all')} <ChevronRight size={16} />
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto scroll-px-4 px-4 pb-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} wide />)
            : featured.map((l) => <ListingCard key={l.id} listing={l} wide />)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="h-section">{t('Latest listings')}</h2>
          <Link href="/search" className="flex items-center text-sm font-semibold text-brand-700">
            {t('See all')} <ChevronRight size={16} />
          </Link>
        </div>
        <Grid items={latest} loading={loading} />
      </section>
    </div>
  );
}
