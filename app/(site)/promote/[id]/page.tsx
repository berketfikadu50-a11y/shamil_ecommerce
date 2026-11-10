'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Check, Crown, Loader2, PackageX, Star, Zap } from 'lucide-react';
import { PACKAGES } from '@/lib/data';
import { fmt, useStore } from '@/lib/store';
import { Empty, Price, Thumb } from '@/components/ui';

const ICONS = { basic: Zap, featured: Star, premium: Crown };

export default function PromotePage() {
  const { id } = useParams<{ id: string }>();
  const { t, listings, promote, toast } = useStore();
  const listing = listings.find((l) => l.id === id);
  const [pkgId, setPkgId] = useState<string>('featured');
  const [paying, setPaying] = useState<string | null>(null);
  const [paidWith, setPaidWith] = useState<string | null>(null);

  if (!listing) {
    return (
      <Empty icon={PackageX} title={t('Listing not found')} hint={t('It may have been sold or removed.')}>
        <Link href="/" className="btn-primary">{t('Back to home')}</Link>
      </Empty>
    );
  }

  const pkg = PACKAGES.find((p) => p.id === pkgId)!;

  const pay = (method: string) => {
    setPaying(method);
    setTimeout(() => {
      promote(listing.id, pkg.id);
      setPaying(null);
      setPaidWith(method);
      toast(t('Payment received'));
    }, 1600);
  };

  if (paidWith) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-2 pt-12 text-center">
        <div className="animate-pop grid h-24 w-24 place-items-center rounded-full bg-brand-600 text-white">
          <Check size={48} strokeWidth={3} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight">{t('Payment received')}</h1>
        <p className="mt-2 text-ink/65">{t('Your ad is promoted for {n} days.', { n: pkg.days })}</p>
        <p className="mt-4 rounded-full bg-mist px-4 py-2 text-sm font-semibold">
          {t('Paid {a} ETB with {m}', { a: fmt(pkg.price), m: paidWith })}
        </p>
        <Link href={`/listing/${listing.id}`} className="btn-primary mt-8 w-full">{t('View ad')}</Link>
        <Link href="/profile" className="btn mt-1 w-full text-brand-700">{t('View my ads')}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl pt-5">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">{t('Promote this ad')}</h1>
      <p className="mt-1 text-ink/60">{t('Promoted ads sell up to 3 times faster.')}</p>

      <div className="card mt-4 flex items-center gap-3 p-3">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
          <Thumb listing={listing} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{listing.title}</p>
          <Price listing={listing} />
        </div>
      </div>

      <h2 className="h-section mb-3 mt-7">{t('Choose a package')}</h2>
      <div className="space-y-3" role="radiogroup">
        {PACKAGES.map((p) => {
          const on = p.id === pkgId;
          const Icon = ICONS[p.id];
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPkgId(p.id)}
              className={`relative block w-full rounded-3xl border-2 p-4 text-left transition ${on ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'}`}
            >
              {p.id === 'featured' && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-sun-400 px-2.5 py-0.5 text-[11px] font-bold text-ink">{t('Most popular')}</span>
              )}
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${on ? 'bg-brand-600 text-white' : 'bg-mist text-ink/70'}`}>
                  <Icon size={20} />
                </span>
                <div className="flex-1">
                  <p className="font-display text-lg font-bold leading-tight">{t(p.name)}</p>
                  <p className="text-sm text-ink/55">{t('{n} days', { n: p.days })}</p>
                </div>
                <Price listing={{ price: p.price }} className="text-xl" />
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check size={16} strokeWidth={3} className="mt-0.5 shrink-0 text-brand-600" /> {t(perk)}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {[
          { name: 'Telebirr', cls: 'bg-[#0072BC] hover:bg-[#00629f] text-white' },
          { name: 'Chapa', cls: 'bg-[#7DC400] hover:bg-[#70b000] text-ink' },
        ].map((m) => (
          <button key={m.name} type="button" disabled={!!paying} className={`btn w-full ${m.cls}`} onClick={() => pay(m.name)}>
            {paying === m.name ? (
              <>
                <Loader2 size={18} className="animate-spin" /> {t('Processing payment')}
              </>
            ) : (
              <>
                {t('Pay with {m}', { m: m.name })}
                <span className="font-display font-bold">{fmt(pkg.price)} ETB</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
