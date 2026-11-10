'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Empty, Grid } from '@/components/ui';

export default function FavoritesPage() {
  const { t, listings, favs } = useStore();
  const items = listings.filter((l) => favs.includes(l.id));

  return (
    <div className="pt-5">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">{t('Favorites')}</h1>
      <p className="mb-4 text-sm text-ink/55">{t('{n} ads', { n: items.length })}</p>
      {items.length === 0 ? (
        <Empty icon={Heart} title={t('No favorites yet')} hint={t('Tap the heart on any listing to save it here.')}>
          <Link href="/" className="btn-primary">
            {t('Browse listings')}
          </Link>
        </Empty>
      ) : (
        <Grid items={items} />
      )}
    </div>
  );
}
