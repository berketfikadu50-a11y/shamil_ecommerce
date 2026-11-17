'use client';

import Link from 'next/link';
import { ChevronRight, Truck } from 'lucide-react';
import type { Listing } from '@/lib/data';
import { DELIVERABLE, MIN_FEE, type Stage } from '@/lib/delivery';
import { fmt, useStore } from '@/lib/store';

export const STAGE_LABEL: Record<Stage, string> = {
  placed: 'Finding rider',
  assigned: 'Rider assigned',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STAGE_TONE: Record<Stage, string> = {
  placed: 'bg-sun-100 text-sun-700',
  assigned: 'bg-brand-50 text-brand-700',
  on_the_way: 'bg-brand-600 text-white',
  delivered: 'bg-mist text-ink/70',
  cancelled: 'bg-rose-50 text-rose-600',
};

export function StageChip({ stage }: { stage: Stage }) {
  const { t } = useStore();
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${STAGE_TONE[stage]}`}>{t(STAGE_LABEL[stage])}</span>;
}

/** Time helpers that speak the current UI language. */
export function useDeliveryText() {
  const { t } = useStore();
  const clock = (ts: number) => {
    const d = new Date(ts);
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === new Date().toDateString() ? time : `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${time}`;
  };
  const left = (ms: number) => {
    const m = Math.ceil(ms / 60_000);
    if (m <= 1) return t('less than a minute');
    if (m < 120) return t('{n} min', { n: m });
    const h = Math.round(m / 60);
    return h < 48 ? t('{n} hours', { n: h }) : t('{n} days', { n: Math.round(h / 24) });
  };
  return { clock, left };
}

/** "Delivery available" entry point shown on a listing. Pass the display classes (flex / hidden). */
export function DeliveryOffer({ listing, className = '' }: { listing: Listing; className?: string }) {
  const { t } = useStore();
  if (!DELIVERABLE.includes(listing.cat) || listing.status !== 'active' || listing.sellerId === 'me') return null;
  return (
    <Link
      href={`/deliver/${listing.id}`}
      className={`items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-3.5 transition hover:border-brand-500 ${className}`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
        <Truck size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{t('Get it delivered')}</span>
        <span className="block text-sm text-ink/65">{t('To your door from {n} ETB, with live tracking', { n: fmt(MIN_FEE) })}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-brand-700" />
    </Link>
  );
}
