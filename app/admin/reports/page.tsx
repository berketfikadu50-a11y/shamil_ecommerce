'use client';

import Link from 'next/link';
import { Flag, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Empty, Price, Thumb } from '@/components/ui';

export default function ReportsPage() {
  const { t, reports, listings, closeReport, setStatus, toast } = useStore();
  const open = reports.filter((r) => r.open);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        {t('Reports')} <span className="text-ink/40">{open.length}</span>
      </h1>

      {open.length === 0 ? (
        <div className="card mt-5">
          <Empty icon={ShieldCheck} title={t('No open reports')} hint={t('Reports from buyers will appear here.')} />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {open.map((r) => {
            const l = listings.find((x) => x.id === r.listingId);
            if (!l) return null;
            return (
              <li key={r.id} className="card flex flex-wrap items-center gap-4 p-4">
                <Link href={`/listing/${l.id}`} className="flex min-w-0 flex-1 basis-64 items-center gap-3">
                  <div className="h-14 w-[72px] shrink-0 overflow-hidden rounded-xl">
                    <Thumb listing={l} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{l.title}</p>
                    <Price listing={l} className="text-sm" />
                  </div>
                </Link>
                <div className="basis-56">
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-sm font-semibold text-rose-600">
                    <Flag size={13} /> {t(r.reason)}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">
                    {t('Reported by {name}', { name: r.by })}, {r.when}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn !h-10 !rounded-xl bg-rose-600 !px-3.5 !text-sm text-white hover:bg-rose-700"
                    onClick={() => {
                      setStatus(l.id, 'rejected');
                      closeReport(r.id);
                      toast(t('Ad removed'));
                    }}
                  >
                    {t('Remove ad')}
                  </button>
                  <button
                    type="button"
                    className="btn-outline !h-10 !rounded-xl !px-3.5 !text-sm"
                    onClick={() => {
                      closeReport(r.id);
                      toast(t('Report dismissed'));
                    }}
                  >
                    {t('Dismiss')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
