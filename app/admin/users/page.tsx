'use client';

import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui';

export default function UsersPage() {
  const { t, users, toggleUser, toast } = useStore();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        {t('Users')} <span className="text-ink/40">{users.length}</span>
      </h1>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-line text-ink/55">
            <tr>
              {['Name', 'Phone', 'Type', 'Ads', 'Joined', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">{t(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className={u.suspended ? 'bg-rose-50/50' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} size={34} />
                    <span className="font-semibold">{u.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">{u.phone}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.type === 'Dealer' ? 'bg-brand-50 text-brand-700' : 'bg-mist text-ink/65'}`}>{t(u.type)}</span>
                </td>
                <td className="px-4 py-3 font-semibold">{u.ads}</td>
                <td className="px-4 py-3 text-ink/70">{u.joined}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${u.suspended ? 'text-rose-600' : 'text-brand-700'}`}>{t(u.suspended ? 'Suspended' : 'Active')}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="btn-outline !h-9 !rounded-xl !px-3 !text-sm"
                    onClick={() => {
                      toggleUser(u.id);
                      toast(t(u.suspended ? 'User restored' : 'User suspended'));
                    }}
                  >
                    {t(u.suspended ? 'Restore' : 'Suspend')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
