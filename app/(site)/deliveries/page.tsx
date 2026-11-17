'use client';

import Link from 'next/link';
import { ChevronRight, Truck } from 'lucide-react';
import { place } from '@/lib/data';
import { track } from '@/lib/delivery';
import { useNow, useStore } from '@/lib/store';
import { StageChip, useDeliveryText } from '@/components/delivery';
import { Empty, Thumb } from '@/components/ui';

export default function DeliveriesPage() {
  const { t, deliveries, listings } = useStore();
  const { clock, left } = useDeliveryText();
  const now = useNow(1000);
  const mine = deliveries.filter((d) => d.mine).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-2xl pt-5">
      <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight">{t('My deliveries')}</h1>
      {mine.length === 0 ? (
        <Empty icon={Truck} title={t('No deliveries yet')} hint={t('Phones, electronics, furniture and fashion can be delivered to your door.')}>
          <Link href="/" className="btn-primary">{t('Browse listings')}</Link>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {mine.map((d) => {
            const l = listings.find((x) => x.id === d.listingId);
            if (!l) return null;
            const s = now === null ? null : track(d, now);
            const sub = !s
              ? ''
              : s.stage === 'assigned' || s.stage === 'on_the_way'
                ? t('Arrives in about {n}', { n: left(s.remainingMs) })
                : s.stage === 'delivered'
                  ? t('Delivered at {time}', { time: clock(s.times.delivered!) })
                  : s.stage === 'placed'
                    ? t('Matching your order with a rider near the seller.')
                    : t('Order cancelled');
            return (
              <li key={d.id}>
                <Link href={`/deliveries/${d.id}`} className="card flex items-center gap-3 p-3 transition hover:shadow-lift">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                    <Thumb listing={l} />
                  </div>
                  <div className="min-w-0 flex-1">
                    {s ? <StageChip stage={s.stage} /> : <span className="skeleton inline-block h-6 w-20 rounded-full" />}
                    <p className="mt-1 truncate font-semibold">{l.title}</p>
                    <p className="truncate text-sm text-ink/60">
                      {place(d.pickupPlace)} → {place(d.dropoffPlace)}
                    </p>
                    <p className="truncate text-xs text-ink/50">{sub}</p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-ink/30" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
