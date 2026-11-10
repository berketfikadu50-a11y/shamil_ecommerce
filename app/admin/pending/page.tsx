'use client';

import Link from 'next/link';
import { Check, CircleCheckBig, X } from 'lucide-react';
import { CATEGORIES, sellerById } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Empty, Price, SellerBadge, Thumb, useAgo } from '@/components/ui';

export default function PendingAdsPage() {
  const { t, listings, setStatus, toast } = useStore();
  const ago = useAgo();
  const pending = listings.filter((l) => l.status === 'pending');

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        {t('Pending ads')} <span className="text-ink/40">{pending.length}</span>
      </h1>

      {pending.length === 0 ? (
        <div className="card mt-5">
          <Empty icon={CircleCheckBig} title={t('No ads waiting for review')} hint={t('New ads will appear here as sellers post them.')} />
        </div>
      ) : (
        <div className="card mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-ink/55">
              <tr>
                {['Ad', 'Category', 'Seller', 'Price', 'Submitted', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pending.map((l) => {
                const seller = sellerById(l.sellerId);
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-3">
                      <Link href={`/listing/${l.id}`} className="flex items-center gap-3">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl">
                          <Thumb listing={l} />
                        </div>
                        <div>
                          <p className="font-semibold">{l.title}</p>
                          <p className="text-xs text-ink/55">{l.city}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{t(CATEGORIES.find((c) => c.slug === l.cat)!.name)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{seller.name}</p>
                      <SellerBadge dealer={seller.dealer} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3"><Price listing={l} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/60">{ago(l.daysAgo)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-primary !h-9 !rounded-xl !px-3 !text-sm"
                          onClick={() => {
                            setStatus(l.id, 'active');
                            toast(t('Ad approved and now live'));
                          }}
                        >
                          <Check size={15} strokeWidth={3} /> {t('Approve')}
                        </button>
                        <button
                          type="button"
                          className="btn !h-9 !rounded-xl border border-rose-200 bg-rose-50 !px-3 !text-sm text-rose-600 hover:bg-rose-100"
                          onClick={() => {
                            setStatus(l.id, 'rejected');
                            toast(t('Ad rejected'));
                          }}
                        >
                          <X size={15} strokeWidth={3} /> {t('Reject')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
