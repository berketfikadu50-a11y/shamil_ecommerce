'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Check, ChevronRight, PackageX, Phone, Share2, Star } from 'lucide-react';
import { place } from '@/lib/data';
import { riderById, track } from '@/lib/delivery';
import { fmt, useNow, useStore } from '@/lib/store';
import { DeliveryMap, type MapLine, type MapMarker } from '@/components/map';
import { StageChip, useDeliveryText } from '@/components/delivery';
import { Avatar, Empty, Thumb } from '@/components/ui';

const HEADLINE = {
  placed: 'Finding a rider',
  assigned: 'Rider is going to the seller',
  on_the_way: 'On the way to you',
  delivered: 'Delivered',
  cancelled: 'Order cancelled',
};

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { t, deliveries, listings, cancelDelivery, rateDelivery, toast } = useStore();
  const { clock, left } = useDeliveryText();
  const now = useNow(1000);
  const [showPhone, setShowPhone] = useState(false);

  const d = deliveries.find((x) => x.id === id);
  const listing = listings.find((l) => l.id === d?.listingId);

  if (!d || !listing) {
    return (
      <Empty icon={PackageX} title={t('Order not found')}>
        <Link href="/deliveries" className="btn-primary">{t('My deliveries')}</Link>
      </Empty>
    );
  }

  if (now === null) {
    return (
      <div className="pt-5" aria-hidden>
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton mt-4 h-72 rounded-3xl" />
        <div className="skeleton mt-4 h-28 rounded-3xl" />
      </div>
    );
  }

  const s = track(d, now);
  const rider = riderById(d.riderId);
  const live = s.stage === 'assigned' || s.stage === 'on_the_way';

  const markers: MapMarker[] = [
    { id: 'pickup', pos: d.pickup, kind: 'pickup', tip: t('Seller') },
    { id: 'drop', pos: d.dropoff, kind: 'dropoff', tip: t('Drop-off') },
  ];
  if (s.riderPos && live) markers.push({ id: 'rider', pos: s.riderPos, kind: 'rider', tip: rider?.name });
  const lines: MapLine[] = [{ id: 'plan', path: s.mainPath, tone: 'planned' }];
  if (s.stage === 'assigned') lines.push({ id: 'approach', path: s.toPickupPath, tone: 'approach' });
  if (s.driven.length) lines.push({ id: 'driven', path: s.driven, tone: 'driven' });

  const subline =
    s.stage === 'placed'
      ? t('Matching your order with a rider near the seller.')
      : live
        ? t('Arrives in about {n}', { n: left(s.remainingMs) })
        : s.stage === 'delivered'
          ? t('Delivered at {time}', { time: clock(s.times.delivered!) })
          : t('You will not be charged for this order.');

  const reached = { placed: 1, assigned: 2, on_the_way: 3, delivered: 4, cancelled: 1 }[s.stage];
  const steps = [
    { label: 'Order placed', time: s.times.placed },
    { label: 'Rider assigned', time: s.times.assigned },
    { label: 'Picked up from the seller', time: s.times.picked },
    { label: 'Delivered', time: s.times.delivered },
  ];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* clipboard can be blocked; the toast still confirms the action for the demo */
    }
    toast(t('Link copied'));
  };

  return (
    <div className="pt-5 md:grid md:grid-cols-[1.4fr_1fr] md:gap-8">
      <div>
        <StageChip stage={s.stage} />
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight">{t(HEADLINE[s.stage])}</h1>
        <p className="mt-0.5 text-ink/65">{subline}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(s.progress * 100)}>
          <div className={`h-full rounded-full transition-all duration-1000 ${s.stage === 'cancelled' ? 'bg-rose-400' : 'bg-brand-600'}`} style={{ width: `${s.progress * 100}%` }} />
        </div>

        <div className="relative isolate -mx-4 mt-4 h-80 overflow-hidden border-y border-line md:mx-0 md:h-[460px] md:rounded-3xl md:border">
          <DeliveryMap markers={markers} lines={lines} fit={[d.pickup, d.dropoff, ...(s.stage === 'assigned' ? [s.toPickupPath[0]] : [])]} fitKey={d.id + s.stage} />
        </div>
      </div>

      <div className="mt-5 space-y-4 md:mt-0">
        {rider && s.stage !== 'cancelled' && s.stage !== 'placed' && (
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <Avatar name={rider.name} size={52} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{rider.name}</p>
                <p className="text-sm text-ink/60">
                  {t(rider.vehicle)}, {rider.plate}
                </p>
                <p className="flex items-center gap-1 text-sm font-semibold">
                  <Star size={14} className="fill-sun-400 text-sun-400" /> {rider.rating}
                  <span className="font-normal text-ink/50">{t('{n} trips', { n: fmt(rider.trips) })}</span>
                </p>
              </div>
            </div>
            {live && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {showPhone ? (
                  <a href={`tel:${rider.phone.replace(/\s/g, '')}`} className="btn-primary !h-11 !px-2 text-sm">
                    <Phone size={16} /> {rider.phone}
                  </a>
                ) : (
                  <button type="button" className="btn-primary !h-11 text-sm" onClick={() => setShowPhone(true)}>
                    <Phone size={16} /> {t('Call rider')}
                  </button>
                )}
                <button type="button" className="btn-soft !h-11 text-sm" onClick={share}>
                  <Share2 size={16} /> {t('Share tracking')}
                </button>
              </div>
            )}
            {s.stage === 'delivered' && d.mine && (
              <div className="mt-3 border-t border-line pt-3">
                <p className="text-sm font-semibold">{d.rating ? t('Your rating') : t('Rate your delivery')}</p>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n}`}
                      disabled={!!d.rating}
                      onClick={() => {
                        rateDelivery(d.id, n);
                        toast(t('Thanks for rating your delivery'));
                      }}
                      className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-sun-100 disabled:hover:bg-transparent"
                    >
                      <Star size={24} className={(d.rating ?? 0) >= n ? 'fill-sun-400 text-sun-400' : 'text-ink/25'} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card p-4">
          <ol>
            {steps.map((step, i) => {
              const done = i < reached && s.stage !== 'cancelled' ? true : i === 0;
              const upcomingEta = !done && i === steps.length - 1 && step.time && live;
              return (
                <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < steps.length - 1 && <span className={`absolute left-[11px] top-7 h-[calc(100%-1.5rem)] w-0.5 ${i < reached - 1 ? 'bg-brand-600' : 'bg-line'}`} />}
                  <span className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? 'bg-brand-600 text-white' : 'border-2 border-line bg-white'}`}>
                    {done && <Check size={14} strokeWidth={3} />}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${done ? '' : 'text-ink/45'}`}>{t(step.label)}</p>
                    {done && step.time && <p className="text-xs text-ink/55">{clock(step.time)}</p>}
                    {upcomingEta && <p className="text-xs text-ink/55">{t('Expected by {time}', { time: clock(step.time!) })}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="card p-4">
          <Link href={`/listing/${listing.id}`} className="flex items-center gap-3">
            <div className="h-14 w-[72px] shrink-0 overflow-hidden rounded-xl">
              <Thumb listing={listing} />
            </div>
            <p className="min-w-0 flex-1 truncate font-semibold">{listing.title}</p>
            <ChevronRight size={18} className="shrink-0 text-ink/30" />
          </Link>
          <dl className="mt-3 divide-y divide-line border-t border-line text-sm">
            {[
              [t('Pickup'), place(d.pickupPlace)],
              [t('Drop-off'), `${place(d.dropoffPlace)}${d.note ? `, ${d.note}` : ''}`],
              [t('Distance'), `${d.km} km`],
              [t('Delivery fee'), `${fmt(d.fee)} ETB`],
              [t('Payment'), t(d.payment)],
              [t('Order number'), d.id],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-ink/60">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {(s.stage === 'placed' || s.stage === 'assigned') && (
          <button
            type="button"
            className="btn w-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            onClick={() => {
              cancelDelivery(d.id);
              toast(t('Order cancelled'));
            }}
          >
            {t('Cancel order')}
          </button>
        )}
      </div>
    </div>
  );
}
