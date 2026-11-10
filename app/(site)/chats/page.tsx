'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { sellerById } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Avatar, Empty, Thumb } from '@/components/ui';

export default function ChatsPage() {
  const { t, convos, listings } = useStore();

  return (
    <div className="mx-auto max-w-2xl pt-5">
      <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight">{t('Chats')}</h1>
      {convos.length === 0 ? (
        <Empty icon={MessageCircle} title={t('No conversations yet')} hint={t('Message a seller from any listing to start one.')}>
          <Link href="/" className="btn-primary">{t('Browse listings')}</Link>
        </Empty>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {convos.map((c) => {
            const seller = sellerById(c.sellerId);
            const listing = listings.find((l) => l.id === c.listingId);
            const last = c.messages[c.messages.length - 1];
            return (
              <li key={c.id}>
                <Link href={`/chats/${c.id}`} className="flex items-center gap-3 p-3.5 transition hover:bg-mist">
                  <div className="relative">
                    <Avatar name={seller.name} size={52} />
                    {listing && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 overflow-hidden rounded-md ring-2 ring-white">
                        <Thumb listing={listing} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold">{seller.name}</p>
                      <span className="shrink-0 text-xs text-ink/50">{last?.time}</span>
                    </div>
                    <p className="truncate text-xs font-medium text-brand-700">{listing?.title}</p>
                    <p className={`truncate text-sm ${c.unread ? 'font-semibold text-ink' : 'text-ink/55'}`}>{last?.text ?? t('Write a message')}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">{c.unread}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
