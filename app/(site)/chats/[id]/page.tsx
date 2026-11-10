'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight, MessageCircleOff, Send } from 'lucide-react';
import { place, sellerById } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Avatar, Empty, Price, SellerBadge, Thumb } from '@/components/ui';

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { t, convos, listings, sendMessage, markRead } = useStore();
  const convo = convos.find((c) => c.id === id);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const count = convo?.messages.length ?? 0;

  useEffect(() => {
    if (id) markRead(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: count > 6 ? 'smooth' : 'auto', block: 'end' });
  }, [count]);

  if (!convo) {
    return (
      <Empty icon={MessageCircleOff} title={t('Conversation not found')}>
        <Link href="/chats" className="btn-primary">{t('Chats')}</Link>
      </Empty>
    );
  }

  const seller = sellerById(convo.sellerId);
  const listing = listings.find((l) => l.id === convo.listingId);

  return (
    <div className="mx-auto max-w-2xl pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Avatar name={seller.name} size={44} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{seller.name}</p>
          <SellerBadge dealer={seller.dealer} />
        </div>
      </div>

      {listing && (
        <Link href={`/listing/${listing.id}`} className="card sticky top-[72px] z-20 mt-3 flex items-center gap-3 p-2.5">
          <div className="h-14 w-[72px] shrink-0 overflow-hidden rounded-xl">
            <Thumb listing={listing} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{listing.title}</p>
            <Price listing={listing} className="text-[15px]" />
            <p className="truncate text-xs text-ink/55">{place(listing.city)}</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-ink/30" />
        </Link>
      )}

      <div className="mt-5 space-y-2">
        {convo.messages.map((m, i) => (
          <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
            <div className={`animate-toast max-w-[80%] rounded-3xl px-4 py-2.5 ${m.me ? 'rounded-br-lg bg-brand-600 text-white' : 'rounded-bl-lg bg-mist'}`}>
              <p className="leading-snug">{m.text}</p>
              <p className={`mt-0.5 text-right text-[11px] ${m.me ? 'text-white/70' : 'text-ink/45'}`}>{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={end} className="h-1 scroll-mb-28" />
      </div>

      <form
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          sendMessage(convo.id, text.trim());
          setText('');
        }}
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input className="input !rounded-full" placeholder={t('Write a message')} aria-label={t('Write a message')} value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" aria-label={t('Send')} disabled={!text.trim()} className="btn-primary !w-12 shrink-0 !rounded-full !px-0">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
