'use client';

import Link from 'next/link';
import { Clock, Flag, LayoutList, Sparkles } from 'lucide-react';
import { CATEGORIES, WEEK_CHART } from '@/lib/data';
import { fmt, useStore } from '@/lib/store';

// The demo catalogue is small, so headline totals sit on top of a realistic base.
const BASE_TOTAL = 12480;

export default function AdminDashboard() {
  const { t, listings, reports } = useStore();
  const active = listings.filter((l) => l.status === 'active');
  const pending = listings.filter((l) => l.status === 'pending').length;
  const reported = reports.filter((r) => r.open).length;
  const today = WEEK_CHART[WEEK_CHART.length - 1].n + listings.filter((l) => l.id.startsWith('u')).length;

  const stats = [
    { label: 'Total listings', value: fmt(BASE_TOTAL + active.length), icon: LayoutList, href: '/admin/categories', tone: 'bg-brand-50 text-brand-700' },
    { label: 'New today', value: fmt(today), icon: Sparkles, href: '/admin/pending', tone: 'bg-brand-50 text-brand-700' },
    { label: 'Pending', value: fmt(pending), icon: Clock, href: '/admin/pending', tone: 'bg-sun-100 text-sun-700' },
    { label: 'Reported', value: fmt(reported), icon: Flag, href: '/admin/reports', tone: 'bg-rose-50 text-rose-600' },
  ];

  const chart = WEEK_CHART.map((d, i) => (i === WEEK_CHART.length - 1 ? { ...d, n: today } : d));
  const peak = Math.max(...chart.map((d) => d.n));
  const byCat = CATEGORIES.map((c) => ({ name: c.name, n: active.filter((l) => l.cat === c.slug).length })).sort((a, b) => b.n - a.n);
  const catPeak = Math.max(...byCat.map((c) => c.n), 1);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{t('Dashboard')}</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 transition hover:shadow-lift">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
              <s.icon size={20} />
            </span>
            <p className="mt-3 font-display text-3xl font-extrabold tracking-tight">{s.value}</p>
            <p className="text-sm text-ink/60">{t(s.label)}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <section className="card p-5">
          <h2 className="font-display text-lg font-bold">{t('New listings, last 7 days')}</h2>
          <div className="mt-5 flex h-52 items-end gap-2 md:gap-4" role="img" aria-label={chart.map((d) => `${d.day} ${d.n}`).join(', ')}>
            {chart.map((d, i) => (
              <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-xs font-semibold text-ink/70">{d.n}</span>
                <div
                  className={`w-full max-w-12 rounded-t-lg transition-all duration-500 ${i === chart.length - 1 ? 'bg-brand-600' : 'bg-brand-200'}`}
                  style={{ height: `${(d.n / peak) * 78}%` }}
                />
                <span className="text-xs text-ink/55">{d.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg font-bold">{t('Listings by category')}</h2>
          <ul className="mt-4 space-y-2.5">
            {byCat.map((c) => (
              <li key={c.name} className="grid grid-cols-[92px_1fr_28px] items-center gap-2 text-sm">
                <span className="truncate text-ink/70">{t(c.name)}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-mist">
                  <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(c.n / catPeak) * 100}%` }} />
                </span>
                <span className="text-right font-semibold">{c.n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-brand-900 p-5 text-white">
        <div>
          <p className="text-sm text-white/65">{t('Revenue from promotions this month')}</p>
          <p className="font-display text-3xl font-extrabold tracking-tight">
            {fmt(184650 + listings.filter((l) => l.sellerId === 'me' && (l.promoted || l.featured)).length * 400)} <span className="text-base font-semibold text-white/65">ETB</span>
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          {[
            ['Basic', 214],
            ['Featured', 268],
            ['Premium', 51],
          ].map(([name, n]) => (
            <div key={name}>
              <p className="font-display text-xl font-bold">{n}</p>
              <p className="text-white/65">{t(String(name))}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
