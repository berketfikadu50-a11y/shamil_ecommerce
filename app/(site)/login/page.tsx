'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Loader2, ShieldCheck, Smartphone } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const { t, login, toast } = useStore();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [busy, setBusy] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const full = `+251 ${phone}`;
  const phoneOk = phone.replace(/\D/g, '').length >= 9;
  const codeOk = code.every(Boolean);

  const setDigit = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setCode((c) => c.map((d, j) => (j === i ? '' : d)));
      return;
    }
    // Handles both single key presses and a pasted 6-digit code.
    setCode((c) => {
      const nextCode = [...c];
      digits.split('').slice(0, 6 - i).forEach((d, k) => (nextCode[i + k] = d));
      return nextCode;
    });
    boxes.current[Math.min(i + digits.length, 5)]?.focus();
  };

  const verify = () => {
    setBusy(true);
    setTimeout(() => {
      login(full);
      toast(t('Signed in'));
      router.replace('/profile');
    }, 900);
  };

  return (
    <div className="mx-auto max-w-sm pt-10">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-brand-700">
        {stage === 'phone' ? <Smartphone size={30} /> : <ShieldCheck size={30} />}
      </div>

      {stage === 'phone' ? (
        <form
          className="animate-page"
          onSubmit={(e) => {
            e.preventDefault();
            if (!phoneOk) return toast(t('Enter a valid phone number'));
            setStage('otp');
            setTimeout(() => boxes.current[0]?.focus(), 50);
          }}
        >
          <h1 className="mt-5 font-display text-[26px] font-extrabold leading-tight tracking-tight">{t('Sign in with your phone')}</h1>
          <p className="mt-2 text-ink/60">{t('We will text you a 6-digit code.')}</p>
          <label className="label mt-6" htmlFor="phone">{t('Phone number')}</label>
          <div className="flex h-14 items-center overflow-hidden rounded-2xl border border-line focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
            <span className="flex h-full items-center gap-2 border-r border-line bg-mist px-3.5 font-semibold">
              <span className="flex h-4 w-6 flex-col overflow-hidden rounded-sm" aria-hidden>
                <span className="flex-1 bg-[#078930]" />
                <span className="flex-1 bg-[#FCDD09]" />
                <span className="flex-1 bg-[#DA121A]" />
              </span>
              +251
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoFocus
              placeholder="911 234 567"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, '').slice(0, 12))}
              className="h-full min-w-0 flex-1 px-4 !text-lg font-semibold tracking-wide placeholder:font-normal placeholder:text-ink/30 focus:outline-none"
            />
          </div>
          <button type="submit" className={`btn-primary mt-5 w-full ${phoneOk ? '' : 'opacity-50'}`}>
            {t('Send code')}
          </button>
        </form>
      ) : (
        <form
          className="animate-page"
          onSubmit={(e) => {
            e.preventDefault();
            if (codeOk) verify();
          }}
        >
          <h1 className="mt-5 font-display text-[26px] font-extrabold leading-tight tracking-tight">{t('Enter the code')}</h1>
          <p className="mt-2 text-ink/60">{t('Sent to {p}', { p: full })}</p>
          <div className="mt-6 grid grid-cols-6 gap-2">
            {code.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  boxes.current[i] = el;
                }}
                aria-label={`Digit ${i + 1}`}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !code[i] && i > 0) boxes.current[i - 1]?.focus();
                }}
                className={`h-14 w-full rounded-2xl border text-center font-display !text-2xl font-bold focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 ${d ? 'border-brand-600 bg-brand-50' : 'border-line'}`}
              />
            ))}
          </div>
          <p className="mt-3 rounded-xl bg-sun-100 px-3 py-2 text-sm font-medium text-sun-700">{t('Demo: any 6 digits work.')}</p>
          <button type="submit" disabled={!codeOk || busy} className="btn-primary mt-5 w-full">
            {busy && <Loader2 size={18} className="animate-spin" />} {t('Verify')}
          </button>
          <div className="mt-3 flex justify-between text-sm font-semibold text-brand-700">
            <button type="button" className="py-2" onClick={() => { setStage('phone'); setCode(Array(6).fill('')); }}>
              {t('Change number')}
            </button>
            <button type="button" className="py-2" onClick={() => toast(t('Code sent again'))}>
              {t('Resend code')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
