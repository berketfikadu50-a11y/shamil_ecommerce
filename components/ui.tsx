'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Car,
  Heart,
  MapPin,
  Shirt,
  Smartphone,
  Sofa,
  Star,
  Tv,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { place, type Cat, type Listing } from '@/lib/data';
import { fmt, useStore } from '@/lib/store';

export const CAT_ICON: Record<Cat, LucideIcon> = {
  vehicles: Car,
  property: Building2,
  phones: Smartphone,
  electronics: Tv,
  jobs: Briefcase,
  services: Wrench,
  furniture: Sofa,
  fashion: Shirt,
};

const hueOf = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return (h * 137) % 360; // 137° steps keep neighbouring ids visually distinct
};

/** Listing photo: an uploaded preview if there is one, otherwise a tinted placeholder. */
export function Thumb({ listing, index = 0, className = '' }: { listing: Listing; index?: number; className?: string }) {
  const src = listing.images?.[index];
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={listing.title}
        loading="lazy"
        draggable={false}
        onError={() => setBroken(true)}
        className={`h-full w-full bg-mist object-cover ${className}`}
      />
    );
  }
  const Icon = CAT_ICON[listing.cat];
  const h = (hueOf(listing.id) + index * 24) % 360;
  const sizes = ['46%', '62%', '38%', '54%'];
  const shifts = ['0%', '-10%', '12%', '4%'];
  return (
    <div
      className={`relative grid h-full w-full place-items-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(145deg, hsl(${h} 55% 90%), hsl(${(h + 28) % 360} 55% 76%))` }}
      role="img"
      aria-label={listing.title}
    >
      <div
        className="absolute -bottom-1/3 left-1/2 h-2/3 w-[130%] -translate-x-1/2 rounded-[50%]"
        style={{ background: `hsl(${h} 40% 66% / .45)` }}
      />
      <Icon
        strokeWidth={1.3}
        className="relative"
        style={{ width: sizes[index % 4], height: sizes[index % 4], color: `hsl(${h} 45% 28%)`, opacity: 0.7, transform: `translateX(${shifts[index % 4]})` }}
      />
    </div>
  );
}

export function Price({ listing, className = '' }: { listing: Pick<Listing, 'price' | 'per'>; className?: string }) {
  const { t } = useStore();
  return (
    <span className={`font-display font-bold tracking-tight text-brand-700 ${className}`}>
      {fmt(listing.price)}
      <span className="ml-1 text-[0.62em] font-semibold tracking-normal text-ink/55">
        ETB{listing.per ? ` / ${t('month')}` : ''}
      </span>
    </span>
  );
}

export function Badges({ listing }: { listing: Listing }) {
  const { t } = useStore();
  return (
    <>
      {listing.featured && (
        <span className="inline-flex items-center gap-1 rounded-full bg-sun-400 px-2 py-1 text-[11px] font-bold text-ink">
          <Star size={11} fill="currentColor" /> {t('Featured')}
        </span>
      )}
      {listing.promoted && (
        <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-1 text-[11px] font-bold text-white">
          <Zap size={11} fill="currentColor" /> {t('Promoted')}
        </span>
      )}
    </>
  );
}

export function useAgo() {
  const { t } = useStore();
  return (d: number) => (d === 0 ? t('Today') : d === 1 ? t('Yesterday') : t('{n} days ago', { n: d }));
}

export function FavButton({ id, className = '' }: { id: string; className?: string }) {
  const { favs, toggleFav, toast, t } = useStore();
  const on = favs.includes(id);
  return (
    <button
      type="button"
      aria-label={on ? t('Saved') : t('Save')}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFav(id);
        toast(t(on ? 'Removed from favorites' : 'Added to favorites'));
      }}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-card transition active:scale-90 ${className}`}
    >
      <Heart size={18} className={on ? 'fill-rose-500 text-rose-500' : 'text-ink/70'} />
    </button>
  );
}

export function ListingCard({ listing, wide = false }: { listing: Listing; wide?: boolean }) {
  const { t } = useStore();
  const ago = useAgo();
  return (
    <Link
      href={`/listing/${listing.id}`}
      className={`card group block overflow-hidden transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1 focus-visible:shadow-lift ${wide ? 'w-[250px] shrink-0 snap-start' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Photo zooms in while the card is hovered or focused, and eases back out after. */}
        <Thumb listing={listing} className="transition-transform duration-500 ease-out group-hover:scale-110 group-focus-visible:scale-110" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badges listing={listing} />
        </div>
        <FavButton id={listing.id} className="absolute right-2 top-2" />
      </div>
      <div className="p-3">
        <Price listing={listing} className="text-[17px] leading-tight" />
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-ink/90">{listing.title}</h3>
        {listing.cat === 'vehicles' && listing.km != null && (
          <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] font-medium text-ink/65">
            <span className="rounded-md bg-mist px-1.5 py-0.5">{fmt(listing.km)} km</span>
            <span className="rounded-md bg-mist px-1.5 py-0.5">{t(listing.trans ?? '')}</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-ink/55">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{listing.city}</span>
          </span>
          <span className="shrink-0">{ago(listing.daysAgo)}</span>
        </div>
      </div>
    </Link>
  );
}

export function CardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`card overflow-hidden ${wide ? 'w-[250px] shrink-0' : ''}`} aria-hidden>
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-5 w-2/3 rounded-md" />
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton h-3 w-1/2 rounded-md" />
      </div>
    </div>
  );
}

export function Grid({ items, loading, count = 8 }: { items: Listing[]; loading?: boolean; count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {loading
        ? Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)
        : items.map((l) => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}

export function Empty({ icon: Icon, title, hint, children }: { icon: LucideIcon; title: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-14 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Icon size={28} />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      {hint && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-fade absolute inset-0 bg-ink/45" onClick={onClose} />
      <div className="animate-sheet relative flex max-h-[88dvh] w-full flex-col rounded-t-[28px] bg-white shadow-lift md:max-w-lg md:rounded-[28px]">
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-mist">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-line p-4">{footer}</div>}
      </div>
    </div>
  );
}

export function SellerBadge({ dealer }: { dealer: boolean }) {
  const { t } = useStore();
  return dealer ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
      <BadgeCheck size={13} /> {t('Verified dealer')}
    </span>
  ) : (
    <span className="text-xs text-ink/55">{t('Private seller')}</span>
  );
}

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-brand-600 font-display font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function LangToggle() {
  const { lang, setLang } = useStore();
  return (
    <div className="flex rounded-full bg-mist p-1 text-[13px] font-semibold" role="group" aria-label="Language">
      {(['en', 'am'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1.5 transition ${lang === l ? 'bg-white text-brand-700 shadow-card' : 'text-ink/55'}`}
        >
          {l === 'en' ? 'EN' : 'አማርኛ'}
        </button>
      ))}
    </div>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Shamil Shop home">
      <span className="grid h-9 w-9 -rotate-6 place-items-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-white">
        <span className="rotate-6">S</span>
      </span>
      <span className="font-display text-[21px] font-extrabold tracking-tight">
        Shamil <span className="text-brand-600">Shop</span>
      </span>
    </Link>
  );
}

export { place };
