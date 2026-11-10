'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArrowLeft, Clock, Flag, FolderTree, LayoutDashboard, Users } from 'lucide-react';
import { useStore } from '@/lib/store';
import { LangToggle } from '@/components/ui';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pending', label: 'Pending ads', icon: Clock },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t, listings, reports } = useStore();
  const pathname = usePathname();
  const counts: Record<string, number> = {
    '/admin/pending': listings.filter((l) => l.status === 'pending').length,
    '/admin/reports': reports.filter((r) => r.open).length,
  };

  return (
    <div className="min-h-dvh bg-mist md:flex">
      <aside className="sticky top-0 z-30 bg-brand-900 text-white md:h-dvh md:w-64 md:shrink-0">
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-5 md:py-6">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white font-display text-lg font-extrabold text-brand-700">S</span>
            <div className="leading-tight">
              <p className="font-display text-lg font-extrabold">Shamil Shop</p>
              <p className="text-xs text-white/60">{t('Admin panel')}</p>
            </div>
          </div>
          <div className="md:hidden">
            <LangToggle />
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3">
          {NAV.map((n) => {
            const on = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? 'page' : undefined}
                className={`flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold transition ${on ? 'bg-white text-brand-900' : 'text-white/75 hover:bg-white/10'}`}
              >
                <Icon size={18} />
                <span className="md:flex-1">{t(n.label)}</span>
                {counts[n.href] > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${on ? 'bg-brand-600 text-white' : 'bg-sun-400 text-ink'}`}>{counts[n.href]}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-3 md:absolute md:inset-x-0 md:bottom-5 md:block">
          <div className="mb-3 px-1">
            <LangToggle />
          </div>
          <Link href="/" className="flex h-11 items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold text-white/75 hover:bg-white/10">
            <ArrowLeft size={18} /> {t('Back to site')}
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 md:hidden">
          <ArrowLeft size={16} /> {t('Back to site')}
        </Link>
        <div key={pathname} className="animate-page mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
