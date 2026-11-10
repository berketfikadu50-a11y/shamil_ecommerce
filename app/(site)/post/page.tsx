'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Camera, Check, ChevronRight, Clock, ImagePlus, MapPin, X, Zap } from 'lucide-react';
import { ADDIS, CATEGORIES, FIELDS, OTHER_CITIES, place, type Cat, type Listing } from '@/lib/data';
import { fmt, useStore } from '@/lib/store';
import { CAT_ICON, Price, Thumb } from '@/components/ui';

const STEPS = ['Choose a category', 'Details', 'Photos', 'Price and contact', 'Review'];

export default function PostPage() {
  const { t, addListing, toast, user, login } = useStore();
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<Cat | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [desc, setDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [done, setDone] = useState<Listing | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fields = cat ? FIELDS[cat] : [];

  const build = (): Listing => {
    const c = cat!;
    const title = c === 'vehicles' ? `${vals.make} ${vals.model} ${vals.year}` : vals.title;
    const specs = fields
      .filter((f) => f.key !== 'title')
      .map((f): [string, string] => {
        const v = vals[f.key] ?? '';
        if (f.key === 'mileage') return [f.label, `${fmt(Number(v))} km`];
        if (f.key === 'area') return [f.label, `${v} m²`];
        return [f.label, v];
      });
    return {
      id: `u${Date.now()}`,
      cat: c,
      title,
      price: Number(price),
      city,
      daysAgo: 0,
      sellerId: 'me',
      desc: desc.trim() || `${title}, ${place(city)}.`,
      specs,
      photos: Math.max(photos.length, 1),
      images: photos.length ? photos : undefined,
      status: 'pending',
      make: vals.make,
      model: vals.model,
      year: vals.year ? Number(vals.year) : undefined,
      km: vals.mileage ? Number(vals.mileage) : undefined,
      trans: vals.transmission,
      fuel: vals.fuel,
    };
  };

  const valid =
    step === 0 ? !!cat
    : step === 1 ? fields.every((f) => (vals[f.key] ?? '').trim())
    : step === 3 ? Number(price) > 0 && !!city && phone.replace(/\D/g, '').length >= 9
    : true;

  const next = () => {
    if (!valid) return toast(t('Fill in every field to continue'));
    if (step < STEPS.length - 1) return setStep(step + 1);
    const l = build();
    addListing(l);
    if (!user) login(phone);
    setDone(l);
    window.scrollTo({ top: 0 });
  };

  const reset = () => {
    setStep(0); setCat(null); setVals({}); setDesc(''); setPhotos([]); setPrice(''); setCity(''); setDone(null);
  };

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-2 pt-12 text-center">
        <div className="animate-pop grid h-24 w-24 place-items-center rounded-full bg-sun-100 text-sun-700">
          <Clock size={44} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight">{t('Your ad is pending approval')}</h1>
        <p className="mt-2 text-ink/65">
          {t('We review every ad before it goes live, usually within 2 hours. You will get an SMS when it is approved.')}
        </p>
        <div className="card mt-6 flex w-full items-center gap-3 p-3 text-left">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
            <Thumb listing={done} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{done.title}</p>
            <Price listing={done} />
          </div>
        </div>
        <Link href={`/promote/${done.id}`} className="btn mt-6 w-full bg-sun-400 text-ink hover:brightness-95">
          <Zap size={18} fill="currentColor" /> {t('Promote this ad')}
        </Link>
        <Link href="/profile?tab=Pending" className="btn-primary mt-3 w-full">
          {t('View my ads')}
        </Link>
        <button type="button" className="btn mt-1 w-full text-brand-700" onClick={reset}>
          {t('Post another ad')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl pb-24 pt-5">
      <p className="text-sm font-semibold text-brand-700">{t('Step {a} of {b}', { a: step + 1, b: STEPS.length })}</p>
      <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{t(STEPS[step])}</h1>
      <div className="mt-3 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
        {STEPS.map((s, i) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-brand-600' : 'bg-line'}`} />
        ))}
      </div>

      <div key={step} className="animate-page mt-6">
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => {
              const Icon = CAT_ICON[c.slug];
              const on = cat === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    if (cat !== c.slug) setVals({});
                    setCat(c.slug);
                    setStep(1);
                  }}
                  className={`flex h-[72px] items-center gap-3 rounded-2xl border px-4 text-left font-semibold transition ${on ? 'border-brand-600 bg-brand-50' : 'border-line bg-white hover:border-ink/25'}`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon size={22} />
                  </span>
                  <span className="flex-1 leading-tight">{t(c.name)}</span>
                  <ChevronRight size={18} className="text-ink/30" />
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="label" htmlFor={`f-${f.key}`}>
                  {t(f.label)}
                  {f.key === 'mileage' && ' (km)'}
                </label>
                {f.type === 'select' ? (
                  <select id={`f-${f.key}`} className="input" value={vals[f.key] ?? ''} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}>
                    <option value="">{t('Select')}</option>
                    {f.options!.map((o) => (
                      <option key={o} value={o}>{t(o)}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`f-${f.key}`}
                    className="input"
                    inputMode={f.type === 'number' ? 'numeric' : 'text'}
                    placeholder={f.placeholder}
                    value={vals[f.key] ?? ''}
                    onChange={(e) => setVals({ ...vals, [f.key]: f.type === 'number' ? e.target.value.replace(/\D/g, '') : e.target.value })}
                  />
                )}
              </div>
            ))}
            <div>
              <label className="label" htmlFor="f-desc">{t('Description')}</label>
              <textarea
                id="f-desc"
                rows={4}
                className="input !h-auto py-3"
                placeholder={t('Tell buyers about the condition, history and anything they should know.')}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-4 text-sm text-ink/60">{t('Add up to 8 photos. The first one is the cover.')}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                const urls = Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f));
                setPhotos((p) => [...p, ...urls].slice(0, 8));
                e.target.value = '';
              }}
            />
            <div className="grid grid-cols-3 gap-3">
              {photos.map((src, i) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-2xl border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/75 px-2 py-0.5 text-[11px] font-semibold text-white">{t('Cover')}</span>}
                  <button type="button" aria-label="Remove photo" onClick={() => setPhotos(photos.filter((p) => p !== src))} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white shadow-card">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {photos.length < 8 && (
                <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 text-sm font-semibold text-brand-700">
                  <ImagePlus size={26} />
                  {t('Add photos')}
                </button>
              )}
            </div>
            {photos.length === 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-mist p-3 text-sm text-ink/65">
                <Camera size={18} className="mt-0.5 shrink-0" />
                {t('No photos yet. Ads with photos get 5 times more calls.')}
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="f-price">{t('Price (ETB)')}</label>
              <input
                id="f-price"
                className="input font-display !text-xl font-bold"
                inputMode="numeric"
                placeholder="2,450,000"
                value={price ? fmt(Number(price)) : ''}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            <div>
              <label className="label" htmlFor="f-loc">{t('Location')}</label>
              <select id="f-loc" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">{t('Select')}</option>
                <optgroup label={t('Addis Ababa sub-cities')}>
                  {ADDIS.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
                <optgroup label={t('Other cities')}>
                  {OTHER_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="f-phone">{t('Phone number')}</label>
              <input id="f-phone" className="input" type="tel" inputMode="tel" placeholder="+251 9XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && cat && (
          <div>
            <p className="mb-4 text-sm text-ink/60">{t('Check your ad before posting')}</p>
            <div className="card overflow-hidden">
              <div className="aspect-[16/9]">
                <Thumb listing={build()} />
              </div>
              <div className="p-4">
                <Price listing={{ price: Number(price) }} className="text-2xl" />
                <h2 className="mt-1 text-lg font-semibold">{build().title}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/60">
                  <MapPin size={14} /> {place(city)}
                </p>
                <dl className="mt-4 divide-y divide-line border-t border-line text-sm">
                  {[[t('Category'), t(CATEGORIES.find((c) => c.slug === cat)!.name)], ...build().specs.map(([k, v]) => [t(k), t(v)]), [t('Photos'), String(photos.length)], [t('Phone number'), phone]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-2.5">
                      <dt className="text-ink/60">{k}</dt>
                      <dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
        <div className="mx-auto flex max-w-xl gap-3">
          {step > 0 && (
            <button type="button" className="btn-outline" onClick={() => setStep(step - 1)}>
              {t('Back')}
            </button>
          )}
          <button type="button" className={`btn-primary flex-1 ${valid ? '' : 'opacity-50'}`} onClick={next}>
            {step === STEPS.length - 1 ? (
              <>
                <Check size={18} strokeWidth={3} /> {t('Post an ad')}
              </>
            ) : (
              t('Continue')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
