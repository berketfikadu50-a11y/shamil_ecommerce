'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, Heart, Home, MessageCircle, Plus, Search, User } from 'lucide-react';
import { useStore } from '@/lib/store';
import { LangToggle, Logo } from './ui';

const TOP_LEVEL = ['/', '/search', '/chats', '/profile'];

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/post', label: 'Post ad', icon: Plus },
  { href: '/chats', label: 'Chats', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Header() {
  const { t, favs, convos } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const top = TOP_LEVEL.includes(pathname);
  const unread = convos.reduce((n, c) => n + c.unread, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {!top && (
          <button
            type="button"
            aria-label={t('Back')}
            onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))}
            className="-ml-1 grid h-10 w-10 place-items-center rounded-full bg-mist md:hidden"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className={top ? '' : 'hidden md:block'}>
          <Logo />
        </div>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {TABS.filter((x) => x.href !== '/post').map((x) => {
            const on = x.href === '/' ? pathname === '/' : pathname.startsWith(x.href);
            return (
              <Link
                key={x.href}
                href={x.href}
                className={`relative rounded-full px-3.5 py-2 text-sm font-semibold transition ${on ? 'bg-brand-50 text-brand-700' : 'text-ink/65 hover:bg-mist'}`}
              >
                {t(x.label)}
                {x.href === '/chats' && unread > 0 && (
                  <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LangToggle />
          <Link href="/favorites" aria-label={t('Favorites')} className="relative grid h-10 w-10 place-items-center rounded-full bg-mist">
            <Heart size={19} />
            {favs.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {favs.length}
              </span>
            )}
          </Link>
          <Link href="/post" className="btn-primary hidden !h-10 !rounded-full !px-4 !text-sm md:inline-flex">
            <Plus size={17} strokeWidth={2.6} /> {t('Post an ad')}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function TabBar() {
  const { t, convos } = useStore();
  const pathname = usePathname();
  if (!TOP_LEVEL.includes(pathname) && pathname !== '/favorites' && !pathname.startsWith('/category')) return null;
  const unread = convos.reduce((n, c) => n + c.unread, 0);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Main">
      <div className="mx-auto grid h-[68px] max-w-md grid-cols-5">
        {TABS.map((x) => {
          const on = x.href === '/' ? pathname === '/' || pathname.startsWith('/category') : pathname.startsWith(x.href);
          const Icon = x.icon;
          if (x.href === '/post') {
            return (
              <Link key={x.href} href={x.href} className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-brand-700">
                <span className="-mt-5 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lift ring-4 ring-white">
                  <Icon size={26} strokeWidth={2.6} />
                </span>
                {t(x.label)}
              </Link>
            );
          }
          return (
            <Link
              key={x.href}
              href={x.href}
              aria-current={on ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${on ? 'text-brand-700' : 'text-ink/50'}`}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={on ? 2.5 : 2} />
                {x.href === '/chats' && unread > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </span>
              {t(x.label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
