'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Bell, ChevronRight, Globe, Heart, LayoutDashboard, LogOut, Megaphone, Truck, UserRound, Zap } from 'lucide-react';
import { track } from '@/lib/delivery';
import { sellerById } from '@/lib/data';
import { useNow, useStore } from '@/lib/store';
import { Avatar, Badges, Empty, Grid, LangToggle, Price, Thumb } from '@/components/ui';

const AD_TABS = ['Active', 'Pending', 'Sold'] as const;
const SECTIONS = ['My ads', 'Favorites', 'Settings'] as const;

function ProfileScreen() {
  const { t, user, logout, listings, favs, setStatus, toast, deliveries } = useStore();
  const now = useNow(5000);
  const params = useSearchParams();
  const initial = params.get('tab');
  const [section, setSection] = useState<(typeof SECTIONS)[number]>(initial === 'Favorites' || initial === 'Settings' ? initial : 'My ads');
  const [adTab, setAdTab] = useState<(typeof AD_TABS)[number]>(initial === 'Pending' || initial === 'Sold' ? initial : 'Active');
  const [notify, setNotify] = useState(true);

  if (!user) {
    return (
      <Empty icon={UserRound} title={t('Sign in to manage your ads and favorites')} hint={t('It takes less than a minute with your phone number.')}>
        <Link href="/login" className="btn-primary">
          {t('Sign in')}
        </Link>
      </Empty>
    );
  }

  const me = sellerById('me');
  const mine = listings.filter((l) => l.sellerId === 'me');
  const byTab = {
    Active: mine.filter((l) => l.status === 'active'),
    Pending: mine.filter((l) => l.status === 'pending' || l.status === 'rejected'),
    Sold: mine.filter((l) => l.status === 'sold'),
  };
  const favItems = listings.filter((l) => favs.includes(l.id));
  const activeDeliveries =
    now === null ? 0 : deliveries.filter((d) => d.mine && ['placed', 'assigned', 'on_the_way'].includes(track(d, now).stage)).length;

  return (
    <div className="mx-auto max-w-3xl pt-5">
      <div className="flex items-center gap-4 rounded-3xl bg-brand-700 p-5 text-white">
        <Avatar name={me.name} size={60} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-bold">{me.name}</h1>
          <p className="text-sm text-white/75">{user.phone}</p>
          <p className="text-sm text-white/75">{t('Member since {y}', { y: me.since })}</p>
        </div>
      </div>

      <Link href="/deliveries" className="card mt-3 flex items-center gap-3 p-3.5 transition hover:shadow-lift">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Truck size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{t('My deliveries')}</span>
          <span className="block truncate text-sm text-ink/55">
            {activeDeliveries > 0 ? t('{n} on the way', { n: activeDeliveries }) : t('Track items delivered to your door')}
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-ink/30" />
      </Link>

      <div className="mt-5 grid grid-cols-3 rounded-2xl bg-mist p-1 text-sm font-semibold" role="tablist">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={section === s}
            onClick={() => setSection(s)}
            className={`h-11 rounded-xl transition ${section === s ? 'bg-white text-brand-700 shadow-card' : 'text-ink/55'}`}
          >
            {t(s)}
          </button>
        ))}
      </div>

      {section === 'My ads' && (
        <div className="animate-page mt-5">
          <div className="flex gap-2">
            {AD_TABS.map((s) => (
              <button key={s} type="button" aria-pressed={adTab === s} onClick={() => setAdTab(s)} className={`chip ${adTab === s ? 'chip-on' : ''}`}>
                {t(s)}
                <span className={`rounded-full px-1.5 text-xs font-bold ${adTab === s ? 'bg-white/25' : 'bg-mist'}`}>{byTab[s].length}</span>
              </button>
            ))}
          </div>

          {byTab[adTab].length === 0 ? (
            <Empty icon={Megaphone} title={t('No ads here yet')} hint={t('Ads you post will show up here.')}>
              <Link href="/post" className="btn-primary">
                {t('Post an ad')}
              </Link>
            </Empty>
          ) : (
            <ul className="mt-4 space-y-3">
              {byTab[adTab].map((l) => (
                <li key={l.id} className="card p-3">
                  <Link href={`/listing/${l.id}`} className="flex items-center gap-3">
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                      <Thumb listing={l} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap gap-1">
                        <Badges listing={l} />
                        {l.status === 'pending' && <span className="rounded-full bg-sun-100 px-2 py-1 text-[11px] font-bold text-sun-700">{t('Pending approval')}</span>}
                        {l.status === 'rejected' && <span className="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600">{t('Rejected')}</span>}
                        {l.status === 'sold' && <span className="rounded-full bg-mist px-2 py-1 text-[11px] font-bold text-ink/60">{t('Sold')}</span>}
                      </div>
                      <p className="truncate font-semibold">{l.title}</p>
                      <Price listing={l} />
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-ink/30" />
                  </Link>
                  {l.status === 'active' && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
                      <Link href={`/promote/${l.id}`} className="btn !h-10 bg-sun-400 text-sm text-ink hover:brightness-95">
                        <Zap size={15} fill="currentColor" /> {t('Promote')}
                      </Link>
                      <button
                        type="button"
                        className="btn-outline !h-10 text-sm"
                        onClick={() => {
                          setStatus(l.id, 'sold');
                          toast(t('Marked as sold'));
                        }}
                      >
                        {t('Mark as sold')}
                      </button>
                    </div>
                  )}
                  {l.status === 'pending' && (
                    <div className="mt-3 border-t border-line pt-3">
                      <Link href={`/promote/${l.id}`} className="btn !h-10 w-full bg-sun-400 text-sm text-ink hover:brightness-95">
                        <Zap size={15} fill="currentColor" /> {t('Promote')}
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {section === 'Favorites' && (
        <div className="animate-page mt-5">
          {favItems.length === 0 ? (
            <Empty icon={Heart} title={t('No favorites yet')} hint={t('Tap the heart on any listing to save it here.')}>
              <Link href="/" className="btn-primary">
                {t('Browse listings')}
              </Link>
            </Empty>
          ) : (
            <Grid items={favItems} />
          )}
        </div>
      )}

      {section === 'Settings' && (
        <div className="animate-page card mt-5 divide-y divide-line">
          <div className="flex min-h-16 items-center gap-3 px-4 py-2">
            <Globe size={20} className="text-ink/60" />
            <span className="flex-1 font-medium">{t('Language')}</span>
            <LangToggle />
          </div>
          <div className="flex min-h-16 items-center gap-3 px-4">
            <Bell size={20} className="text-ink/60" />
            <span className="flex-1">
              <span className="block font-medium">{t('Notifications')}</span>
              <span className="block text-sm text-ink/55">{t('New messages and price drops')}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={notify}
              aria-label={t('Notifications')}
              onClick={() => {
                setNotify(!notify);
                toast(t(notify ? 'Notifications off' : 'Notifications on'));
              }}
              className={`relative h-7 w-12 rounded-full transition-colors ${notify ? 'bg-brand-600' : 'bg-line'}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${notify ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <Link href="/admin" className="flex min-h-16 items-center gap-3 px-4">
            <LayoutDashboard size={20} className="text-ink/60" />
            <span className="flex-1 font-medium">{t('Admin panel')}</span>
            <ChevronRight size={18} className="text-ink/30" />
          </Link>
          <button
            type="button"
            className="flex min-h-16 w-full items-center gap-3 px-4 text-left font-medium text-rose-600"
            onClick={() => {
              logout();
              toast(t('Signed out'));
            }}
          >
            <LogOut size={20} /> {t('Sign out')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileScreen />
    </Suspense>
  );
}
