'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Crosshair, Loader2, MapPin, PackageX, Truck, Zap } from 'lucide-react';
import { ALL_PLACES, place } from '@/lib/data';
import { DELIVERABLE, PLACE_COORDS, defaultDropoff, nearestPlace, pickupFor, quote, routePath, zoneOf, type LatLng } from '@/lib/delivery';
import { fmt, useStore } from '@/lib/store';
import { DeliveryMap } from '@/components/map';
import { useDeliveryText } from '@/components/delivery';
import { Empty, Price, Thumb } from '@/components/ui';

const PAYMENTS = ['Telebirr', 'Chapa', 'Cash on delivery'];

export default function DeliverPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, listings, user, login, placeOrder, toast } = useStore();
  const { left } = useDeliveryText();
  const listing = listings.find((l) => l.id === id);

  const [drop, setDrop] = useState<LatLng | null>(null);
  const [fitKey, setFitKey] = useState(0);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [speed, setSpeed] = useState<'standard' | 'express'>('standard');
  const [payment, setPayment] = useState(PAYMENTS[0]);
  const [placing, setPlacing] = useState(false);

  if (!listing || !DELIVERABLE.includes(listing.cat) || listing.status !== 'active') {
    return (
      <Empty icon={PackageX} title={t('Delivery is not available for this item')} hint={t('Cars, property, jobs and services are arranged directly with the seller.')}>
        <Link href="/" className="btn-primary">{t('Back to home')}</Link>
      </Empty>
    );
  }

  const pickup = pickupFor(listing);
  const dropoff = drop ?? defaultDropoff(listing);
  const q = quote(listing.cat, pickup, dropoff, speed);
  const total = listing.price + (q.ok ? q.fee : 0);

  const moveTo = (p: LatLng, refit = true) => {
    setDrop(p);
    if (refit) setFitKey((k) => k + 1);
  };

  const locate = () => {
    if (!navigator.geolocation) return toast(t('Location access was blocked. Choose an area instead.'));
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const p: LatLng = [pos.coords.latitude, pos.coords.longitude];
        moveTo(p);
        toast(t(zoneOf(p) ? 'Location found' : "We don't deliver to this location yet"));
      },
      () => {
        setLocating(false);
        toast(t('Location access was blocked. Choose an area instead.'));
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const order = () => {
    if (!q.ok) return toast(t("We don't deliver to this location yet"));
    if (phone.replace(/\D/g, '').length < 9) return toast(t('Enter a valid phone number'));
    setPlacing(true);
    setTimeout(() => {
      if (!user) login(phone);
      const orderId = placeOrder({ listing, dropoff, note: note.trim(), phone, speed, payment });
      toast(t('Order placed'));
      router.push(`/deliveries/${orderId}`);
    }, 900);
  };

  const speeds = [
    { id: 'standard' as const, icon: Truck, label: 'Standard', fee: q.standardFee, eta: q.standardEta },
    { id: 'express' as const, icon: Zap, label: 'Express', fee: q.expressFee, eta: q.expressEta },
  ];

  return (
    <div className="mx-auto max-w-xl pb-32 pt-5">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">{t('Delivery')}</h1>

      <div className="card mt-4 flex items-center gap-3 p-3">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
          <Thumb listing={listing} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{listing.title}</p>
          <Price listing={listing} />
          <p className="truncate text-xs text-ink/55">{t('Ships from {p}', { p: place(listing.city) })}</p>
        </div>
      </div>

      <section className="mt-7">
        <h2 className="h-section">{t('Drop-off location')}</h2>
        <p className="mt-1 text-sm text-ink/60">{t('Tap the map or drag the house pin to set where the rider should bring it.')}</p>
        <div className="relative isolate mt-3 h-72 overflow-hidden rounded-3xl border border-line md:h-80">
          <DeliveryMap
            markers={[
              { id: 'pickup', pos: pickup, kind: 'pickup', tip: t('Seller') },
              { id: 'drop', pos: dropoff, kind: 'dropoff', tip: t('Drop-off') },
            ]}
            lines={[{ id: 'route', path: routePath(pickup, dropoff, listing.id), tone: 'route' }]}
            fit={[pickup, dropoff]}
            fitKey={String(fitKey)}
            onPick={(p) => moveTo(p, false)}
            draggableId="drop"
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" className="btn-soft" onClick={locate} disabled={locating}>
            {locating ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
            {t('Use my current location')}
          </button>
          <select
            aria-label={t('Or choose an area')}
            className="input"
            value=""
            onChange={(e) => e.target.value && moveTo(PLACE_COORDS[e.target.value])}
          >
            <option value="">{t('Or choose an area')}</option>
            {ALL_PLACES.map((p) => (
              <option key={p} value={p}>
                {place(p)}
              </option>
            ))}
          </select>
        </div>

        <div className={`mt-3 flex items-start gap-2.5 rounded-2xl p-3 text-sm ${q.ok ? 'bg-brand-50 text-brand-900' : 'bg-rose-50 text-rose-700'}`}>
          <MapPin size={18} className="mt-0.5 shrink-0" />
          {q.ok ? (
            <span>
              <span className="block font-semibold">{t('Near {p}', { p: place(nearestPlace(dropoff)) })}</span>
              {t('{km} km by road from the seller', { km: q.km })}
            </span>
          ) : (
            <span>
              <span className="block font-semibold">{t("We don't deliver to this location yet")}</span>
              {t('We deliver in Addis Ababa, Adama, Hawassa and Bahir Dar.')}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="d-note">{t('Address details')}</label>
            <input id="d-note" className="input" placeholder={t('House number, building, landmark')} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="d-phone">{t('Recipient phone')}</label>
            <input id="d-phone" className="input" type="tel" inputMode="tel" placeholder="+251 9XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </section>

      {q.ok && (
        <section className="mt-7">
          <h2 className="h-section mb-3">{t('Delivery speed')}</h2>
          {q.intercity ? (
            <div className="flex items-center gap-3 rounded-3xl border-2 border-brand-600 bg-brand-50 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white">
                <Truck size={20} />
              </span>
              <div className="flex-1">
                <p className="font-display text-lg font-bold leading-tight">{t('Intercity courier')}</p>
                <p className="text-sm text-ink/60">{t('Arrives in {n}', { n: t('1 to 2 days') })}</p>
              </div>
              <Price listing={{ price: q.standardFee }} className="text-lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3" role="radiogroup">
              {speeds.map((s) => {
                const on = speed === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSpeed(s.id)}
                    className={`rounded-3xl border-2 p-4 text-left transition ${on ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'}`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${on ? 'bg-brand-600 text-white' : 'bg-mist text-ink/70'}`}>
                      <s.icon size={19} />
                    </span>
                    <span className="mt-2 block font-display text-lg font-bold leading-tight">{t(s.label)}</span>
                    <span className="block text-sm text-ink/60">{t('About {n}', { n: left(s.eta * 60_000) })}</span>
                    <Price listing={{ price: s.fee }} className="mt-1.5 block text-lg" />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="mt-7">
        <h2 className="h-section mb-3">{t('Payment')}</h2>
        <div className="flex flex-wrap gap-2">
          {PAYMENTS.map((p) => (
            <button key={p} type="button" aria-pressed={payment === p} className={`chip ${payment === p ? 'chip-on' : ''}`} onClick={() => setPayment(p)}>
              {payment === p && <Check size={15} strokeWidth={3} />} {t(p)}
            </button>
          ))}
        </div>
      </section>

      {q.ok && (
        <section className="card mt-7 p-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/60">{t('Item')}</dt>
              <dd className="font-semibold">{fmt(listing.price)} ETB</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/60">{t('Delivery fee')} ({q.km} km)</dt>
              <dd className="font-semibold">{fmt(q.fee - q.large)} ETB</dd>
            </div>
            {q.large > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">{t('Large item handling')}</dt>
                <dd className="font-semibold">{fmt(q.large)} ETB</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
              <dt className="font-semibold">{t('Total')}</dt>
              <dd>
                <Price listing={{ price: total }} className="text-xl" />
              </dd>
            </div>
          </dl>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-ink/55">{t('Total')}</p>
            <Price listing={{ price: total }} className="text-lg leading-tight" />
          </div>
          <button type="button" className={`btn-primary flex-1 ${q.ok ? '' : 'opacity-50'}`} onClick={order} disabled={placing}>
            {placing ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
            {t('Place order')}
          </button>
        </div>
      </div>
    </div>
  );
}
