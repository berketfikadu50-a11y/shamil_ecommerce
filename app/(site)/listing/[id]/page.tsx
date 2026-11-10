'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Flag, Heart, MapPin, MessageCircle, PackageX, Phone, Send, Share2, Zap } from 'lucide-react';
import { place, sellerById } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Avatar, Badges, Empty, ListingCard, Price, SellerBadge, Sheet, Thumb, useAgo } from '@/components/ui';

const REASONS = ['Scam or fraud', 'Wrong price or details', 'Already sold', 'Duplicate ad'];

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, listings, favs, toggleFav, toast, addReport, startConvo } = useStore();
  const ago = useAgo();
  const listing = listings.find((l) => l.id === id);

  const track = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);

  if (!listing) {
    return (
      <Empty icon={PackageX} title={t('Listing not found')} hint={t('It may have been sold or removed.')}>
        <Link href="/" className="btn-primary">
          {t('Back to home')}
        </Link>
      </Empty>
    );
  }

  const seller = sellerById(listing.sellerId);
  const mine = listing.sellerId === 'me';
  const fav = favs.includes(listing.id);
  const count = listing.images?.length || listing.photos;
  const similar = listings.filter((l) => l.cat === listing.cat && l.id !== listing.id && l.status === 'active').slice(0, 4);

  const go = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* clipboard can be blocked; the toast still confirms the action for the demo */
    }
    toast(t('Link copied'));
  };

  const contact = (
    <>
      {showPhone ? (
        <a href={`tel:${seller.phone.replace(/\s/g, '')}`} className="btn-primary flex-1 !px-3">
          <Phone size={18} /> {seller.phone}
        </a>
      ) : (
        <button type="button" className="btn-primary flex-1 !px-3" onClick={() => setShowPhone(true)}>
          <Phone size={18} /> {t('Call')}
        </button>
      )}
      <button type="button" className="btn flex-1 bg-[#229ED9] !px-3 text-white hover:bg-[#1c8cc2]" onClick={() => toast(t('Opening Telegram chat with {name}', { name: seller.name }))}>
        <Send size={18} /> {t('Telegram')}
      </button>
      <button type="button" className="btn-soft flex-1 !px-3" onClick={() => router.push(`/chats/${startConvo(listing.id, seller.id)}`)}>
        <MessageCircle size={18} /> {t('Chat')}
      </button>
    </>
  );

  return (
    <div className="pt-4 md:grid md:grid-cols-[1.35fr_1fr] md:gap-8">
      <div>
        {/* Gallery */}
        <div className="relative -mx-4 md:mx-0">
          <div
            ref={track}
            onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:rounded-3xl"
          >
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="aspect-[4/3] w-full shrink-0 snap-center">
                <Thumb listing={listing} index={i} />
              </div>
            ))}
          </div>
          <div className="absolute left-3 top-3 flex gap-1">
            <Badges listing={listing} />
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white">
            {slide + 1} / {count}
          </span>
          {count > 1 && (
            <>
              <button type="button" aria-label="Previous photo" disabled={slide === 0} onClick={() => go(slide - 1)} className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-card disabled:opacity-40 md:grid">
                <ChevronLeft size={20} />
              </button>
              <button type="button" aria-label="Next photo" disabled={slide === count - 1} onClick={() => go(slide + 1)} className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-card disabled:opacity-40 md:grid">
                <ChevronRight size={20} />
              </button>
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {Array.from({ length: count }).map((_, i) => (
                  <button key={i} type="button" aria-label={`Photo ${i + 1}`} onClick={() => go(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title block */}
        <div className="mt-4">
          {listing.status !== 'active' && (
            <span className="mb-2 inline-block rounded-full bg-sun-100 px-2.5 py-1 text-xs font-bold text-sun-700">
              {t(listing.status === 'pending' ? 'Pending approval' : listing.status === 'sold' ? 'Sold' : 'Rejected')}
            </span>
          )}
          <Price listing={listing} className="block text-[30px] leading-none" />
          <h1 className="mt-2 text-xl font-semibold leading-snug">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/60">
            <span className="flex items-center gap-1.5">
              <MapPin size={15} /> {place(listing.city)}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} /> {t('Posted')}: {ago(listing.daysAgo)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            aria-pressed={fav}
            className={`btn !h-11 border text-sm ${fav ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-line bg-white'}`}
            onClick={() => {
              toggleFav(listing.id);
              toast(t(fav ? 'Removed from favorites' : 'Added to favorites'));
            }}
          >
            <Heart size={17} className={fav ? 'fill-current' : ''} /> {t(fav ? 'Saved' : 'Save')}
          </button>
          <button type="button" className="btn-outline !h-11 text-sm" onClick={share}>
            <Share2 size={17} /> {t('Share')}
          </button>
          <button type="button" className="btn-outline !h-11 text-sm" onClick={() => setReportOpen(true)}>
            <Flag size={17} /> {t('Report')}
          </button>
        </div>

        <section className="mt-7">
          <h2 className="h-section mb-3">{t('Key details')}</h2>
          <dl className="overflow-hidden rounded-2xl border border-line">
            {listing.specs.map(([k, v], i) => (
              <div key={k} className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${i % 2 ? 'bg-white' : 'bg-mist'}`}>
                <dt className="text-ink/60">{t(k)}</dt>
                <dd className="text-right font-semibold">{t(v)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-7">
          <h2 className="h-section mb-2">{t('Description')}</h2>
          <p className="max-w-prose whitespace-pre-line leading-relaxed text-ink/80">{listing.desc}</p>
        </section>

        <section className="mt-7">
          <h2 className="h-section mb-3">{t('Location')}</h2>
          <div className="relative h-36 overflow-hidden rounded-2xl border border-line bg-brand-50">
            <svg className="absolute inset-0 h-full w-full text-brand-200" aria-hidden>
              <defs>
                <pattern id="streets" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
                  <path d="M0 14H56M0 40H56M20 0V56M46 0V56" stroke="currentColor" strokeWidth="3" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#streets)" />
            </svg>
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lift ring-4 ring-white">
                <MapPin size={20} />
              </span>
              <span className="mt-2 rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-card">{place(listing.city)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Seller column */}
      <aside className="mt-7 md:mt-0">
        <div className="md:sticky md:top-24">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <Avatar name={seller.name} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{seller.name}</p>
                <SellerBadge dealer={seller.dealer} />
              </div>
            </div>
            <div className="mt-3 flex gap-4 border-t border-line pt-3 text-sm text-ink/60">
              <span>{t('Member since {y}', { y: seller.since })}</span>
              <span>{t('{n} active ads', { n: seller.ads })}</span>
            </div>
            {mine ? (
              <div className="mt-4">
                <p className="mb-2 text-sm text-ink/60">{t('This is your ad')}</p>
                <Link href={`/promote/${listing.id}`} className="btn w-full bg-sun-400 text-ink hover:brightness-95">
                  <Zap size={18} fill="currentColor" /> {t('Promote this ad')}
                </Link>
              </div>
            ) : (
              <div className="mt-4 hidden gap-2 md:flex md:flex-col">{contact}</div>
            )}
          </div>
        </div>
      </aside>

      {similar.length > 0 && (
        <section className="mt-9 md:col-span-2">
          <h2 className="h-section mb-3">{t('Similar listings')}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky contact bar on phones */}
      {!mine && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 md:hidden">
          {contact}
        </div>
      )}

      <Sheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={t('Why are you reporting this ad?')}
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-outline" onClick={() => setReportOpen(false)}>
              {t('Cancel')}
            </button>
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() => {
                addReport(listing.id, reason);
                setReportOpen(false);
                toast(t('Report sent. Our team will review it.'));
              }}
            >
              {t('Send report')}
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          {REASONS.map((r) => (
            <label key={r} className={`flex h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 font-medium ${reason === r ? 'border-brand-600 bg-brand-50' : 'border-line'}`}>
              <input type="radio" name="reason" className="h-4 w-4 accent-brand-600" checked={reason === r} onChange={() => setReason(r)} />
              {t(r)}
            </label>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
