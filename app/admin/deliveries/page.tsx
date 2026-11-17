'use client';

import Link from 'next/link';
import { CheckCheck, Clock, Star, Timer, Truck } from 'lucide-react';
import { place } from '@/lib/data';
import { PRICING, RIDERS, ZONES, riderById, track, type LatLng } from '@/lib/delivery';
import { fmt, useNow, useStore } from '@/lib/store';
import { DeliveryMap, type MapLine, type MapMarker } from '@/components/map';
import { StageChip } from '@/components/delivery';
import { Avatar, Thumb } from '@/components/ui';

const ORDER = { placed: 0, assigned: 1, on_the_way: 2, delivered: 3, cancelled: 4 };
// Deliveries completed earlier today, before the demo's own orders.
const DELIVERED_TODAY_BASE = 46;

export default function AdminDeliveriesPage() {
  const { t, deliveries, listings, assignRider, cancelDelivery, toast } = useStore();
  const now = useNow(1000);

  if (now === null) {
    return (
      <div aria-hidden>
        <div className="skeleton h-9 w-48 rounded-lg" />
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-3xl" />
          ))}
        </div>
        <div className="skeleton mt-4 h-96 rounded-3xl" />
      </div>
    );
  }

  const rows = deliveries
    .map((d) => ({ d, s: track(d, now), l: listings.find((x) => x.id === d.listingId) }))
    .sort((a, b) => ORDER[a.s.stage] - ORDER[b.s.stage] || b.d.createdAt - a.d.createdAt);
  const active = rows.filter((r) => r.s.stage === 'placed' || r.s.stage === 'assigned' || r.s.stage === 'on_the_way');
  const awaiting = rows.filter((r) => r.s.stage === 'placed' && !r.d.riderId);
  const busy = new Set(active.filter((r) => r.s.stage !== 'placed').map((r) => r.d.riderId));
  const startOfDay = new Date(now).setHours(0, 0, 0, 0);
  const deliveredToday = DELIVERED_TODAY_BASE + rows.filter((r) => r.s.stage === 'delivered' && r.s.times.delivered! >= startOfDay).length;

  const stats = [
    { label: 'Active deliveries', value: active.length, icon: Truck, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Waiting for a rider', value: awaiting.length, icon: Clock, tone: 'bg-sun-100 text-sun-700' },
    { label: 'Delivered today', value: deliveredToday, icon: CheckCheck, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Average delivery time', value: t('{n} min', { n: 38 }), icon: Timer, tone: 'bg-mist text-ink/70' },
  ];

  const markers: MapMarker[] = [];
  const lines: MapLine[] = [];
  const fit: LatLng[] = [];
  for (const { d, s } of active) {
    const rider = riderById(d.riderId);
    fit.push(d.pickup, d.dropoff);
    lines.push({ id: `${d.id}-plan`, path: s.mainPath, tone: 'planned' });
    if (s.driven.length) lines.push({ id: `${d.id}-drv`, path: s.driven, tone: 'driven' });
    markers.push({ id: `${d.id}-drop`, pos: d.dropoff, kind: 'dropoff', tip: `${d.id}, ${place(d.dropoffPlace)}` });
    if (s.stage === 'placed' || s.stage === 'assigned') markers.push({ id: `${d.id}-pick`, pos: d.pickup, kind: 'pickup', tip: `${d.id}, ${place(d.pickupPlace)}` });
    if (s.riderPos && s.stage !== 'placed') markers.push({ id: `${d.id}-rider`, pos: s.riderPos, kind: 'rider', tip: `${rider?.name}, ${d.id}` });
  }

  // Riders who can take a job in the pickup's city, free ones first.
  const ridersFor = (pickupPlace: string) =>
    RIDERS.filter((r) => r.city === 'Intercity' || r.city === (['Adama', 'Hawassa', 'Bahir Dar'].includes(pickupPlace) ? pickupPlace : 'Addis Ababa')).sort(
      (a, b) => Number(busy.has(a.id)) - Number(busy.has(b.id)),
    );

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{t('Deliveries')}</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
              <s.icon size={20} />
            </span>
            <p className="mt-3 font-display text-3xl font-extrabold tracking-tight">{s.value}</p>
            <p className="text-sm text-ink/60">{t(s.label)}</p>
          </div>
        ))}
      </div>

      <section className="card mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
          <h2 className="font-display text-lg font-bold">{t('Live map')}</h2>
          <div className="flex flex-wrap gap-3 text-xs text-ink/60">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-sun-400" /> {t('Rider')}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-ink" /> {t('Pickup')}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-brand-600" /> {t('Drop-off')}</span>
          </div>
        </div>
        <div className="relative isolate mt-3 h-[360px] md:h-[460px]">
          <DeliveryMap
            markers={markers}
            lines={lines}
            zones={[{ id: 'addis', center: ZONES[0].center, radiusKm: ZONES[0].radiusKm }]}
            fit={fit.length ? fit : [ZONES[0].center]}
            fitKey="admin"
          />
        </div>
      </section>

      <section className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-line text-ink/55">
            <tr>
              {['Order', 'Item', 'Route', 'Rider', 'Status', 'Fee', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">{t(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ d, s, l }) => {
              const rider = riderById(d.riderId);
              return (
                <tr key={d.id} className={s.stage === 'placed' && !d.riderId ? 'bg-sun-100/40' : ''}>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-semibold">{d.id}</p>
                    <p className="text-xs text-ink/55">{d.buyer}</p>
                  </td>
                  <td className="px-4 py-3">
                    {l && (
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-12 shrink-0 overflow-hidden rounded-lg">
                          <Thumb listing={l} />
                        </div>
                        <span className="line-clamp-2 max-w-[180px] font-medium">{l.title}</span>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p>{d.pickupPlace} → {d.dropoffPlace}</p>
                    <p className="text-xs text-ink/55">{d.km} km, {t(d.speed === 'express' ? 'Express' : d.speed === 'intercity' ? 'Intercity courier' : 'Standard')}</p>
                  </td>
                  <td className="px-4 py-3">
                    {s.stage === 'placed' && !d.riderId ? (
                      <select
                        aria-label={t('Assign rider')}
                        className="h-9 rounded-xl border border-line bg-white px-2 !text-sm font-medium focus:border-brand-500 focus:outline-none"
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          assignRider(d.id, e.target.value);
                          toast(t('Rider assigned'));
                        }}
                      >
                        <option value="">{t('Assign rider')}</option>
                        {ridersFor(d.pickupPlace).map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({t(r.vehicle)}){busy.has(r.id) ? `, ${t('On a delivery')}` : ''}
                          </option>
                        ))}
                      </select>
                    ) : rider ? (
                      <span className="whitespace-nowrap font-medium">{rider.name}</span>
                    ) : (
                      <span className="text-ink/40">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StageChip stage={s.stage} /></td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold">{fmt(d.fee)} ETB</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/deliveries/${d.id}`} className="btn-outline !h-9 !rounded-xl !px-3 !text-sm">
                        {t('Track')}
                      </Link>
                      {(s.stage === 'placed' || s.stage === 'assigned') && (
                        <button
                          type="button"
                          className="btn !h-9 !rounded-xl border border-rose-200 bg-rose-50 !px-3 !text-sm text-rose-600 hover:bg-rose-100"
                          onClick={() => {
                            cancelDelivery(d.id);
                            toast(t('Order cancelled'));
                          }}
                        >
                          {t('Cancel')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-lg font-bold">{t('Riders')}</h2>
          <ul className="mt-3 divide-y divide-line">
            {RIDERS.map((r) => {
              const onJob = busy.has(r.id);
              return (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={r.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="truncate text-xs text-ink/55">
                      {t(r.vehicle)}, {r.city === 'Intercity' ? t('Intercity courier') : r.city}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    <Star size={12} className="fill-sun-400 text-sun-400" /> {r.rating}
                  </span>
                  <span className={`w-24 rounded-full px-2 py-1 text-center text-xs font-bold ${onJob ? 'bg-sun-100 text-sun-700' : 'bg-brand-50 text-brand-700'}`}>
                    {t(onJob ? 'On a delivery' : 'Available')}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg font-bold">{t('Zones and pricing')}</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            {[
              ['Addis Ababa', t('{n} km radius', { n: ZONES[0].radiusKm }), t('{a} ETB + {b} ETB per km', { a: PRICING.base, b: PRICING.perKm })],
              ['Adama, Hawassa, Bahir Dar', t('{n} km radius', { n: ZONES[1].radiusKm }), t('{a} ETB + {b} ETB per km', { a: PRICING.base, b: PRICING.perKm })],
              [t('Between cities'), t('Intercity courier'), t('{a} ETB + {b} ETB per km', { a: PRICING.intercityBase, b: PRICING.intercityPerKm })],
              [t('Express'), t('Within a city'), t('Standard fee × {n}', { n: PRICING.expressFactor })],
              [t('Large items'), t('Furniture, by van'), `+${fmt(PRICING.largeItem)} ETB`],
            ].map(([zone, cover, price]) => (
              <div key={zone} className="grid grid-cols-[1fr_auto] gap-x-4 py-2.5">
                <dt className="font-semibold">{zone}</dt>
                <dd className="text-right font-semibold text-brand-700">{price}</dd>
                <dd className="text-xs text-ink/55">{cover}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
