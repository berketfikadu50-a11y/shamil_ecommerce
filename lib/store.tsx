'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import {
  AUTO_REPLIES,
  CONVOS,
  LISTINGS,
  REPORTS,
  USERS,
  type AdminUser,
  type Convo,
  type Listing,
  type Report,
  type Status,
} from './data';
import { AM, OM } from './i18n';
import { makeDelivery, pickRider, pickupFor, quote, seedDeliveries, track, type Delivery, type OrderInput } from './delivery';

export type Lang = 'en' | 'am' | 'om';
const DICT: Record<Lang, Record<string, string> | null> = { en: null, am: AM, om: OM };
type Vars = Record<string, string | number>;

interface Store {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (s: string, vars?: Vars) => string;
  listings: Listing[];
  addListing: (l: Listing) => void;
  setStatus: (id: string, status: Status) => void;
  promote: (id: string, pkg: string) => void;
  favs: string[];
  toggleFav: (id: string) => void;
  user: { phone: string } | null;
  login: (phone: string) => void;
  logout: () => void;
  toast: (msg: string) => void;
  reports: Report[];
  addReport: (listingId: string, reason: string) => void;
  closeReport: (id: string) => void;
  convos: Convo[];
  startConvo: (listingId: string, sellerId: string) => string;
  sendMessage: (convoId: string, text: string) => void;
  markRead: (convoId: string) => void;
  users: AdminUser[];
  toggleUser: (id: string) => void;
  deliveries: Delivery[];
  placeOrder: (o: OrderInput) => string;
  assignRider: (id: string, riderId: string) => void;
  cancelDelivery: (id: string) => void;
  rateDelivery: (id: string, stars: number) => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside <StoreProvider>');
  return s;
}

const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [listings, setListings] = useState<Listing[]>(LISTINGS);
  const [favs, setFavs] = useState<string[]>(['v7', 'ph1']);
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [reports, setReports] = useState<Report[]>(REPORTS);
  const [convos, setConvos] = useState<Convo[]>(CONVOS);
  const [users, setUsers] = useState<AdminUser[]>(USERS);
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => seedDeliveries(Date.now()));
  const seq = useRef(0);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (s: string, vars?: Vars) => {
      let out = DICT[lang]?.[s] ?? s;
      if (vars) for (const k of Object.keys(vars)) out = out.replace(`{${k}}`, String(vars[k]));
      return out;
    },
    [lang],
  );

  const toast = useCallback((msg: string) => {
    const id = ++seq.current;
    setToasts((ts) => [...ts.slice(-2), { id, msg }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 2600);
  }, []);

  const store = useMemo<Store>(
    () => ({
      lang,
      setLang,
      t,
      listings,
      addListing: (l) => setListings((ls) => [l, ...ls]),
      setStatus: (id, status) => setListings((ls) => ls.map((l) => (l.id === id ? { ...l, status, daysAgo: status === 'active' ? 0 : l.daysAgo } : l))),
      promote: (id, pkg) =>
        setListings((ls) =>
          ls.map((l) => (l.id === id ? { ...l, promoted: pkg !== 'featured', featured: pkg !== 'basic' } : l)),
        ),
      favs,
      toggleFav: (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])),
      user,
      login: (phone) => setUser({ phone }),
      logout: () => setUser(null),
      toast,
      reports,
      addReport: (listingId, reason) =>
        setReports((rs) => [{ id: `r${Date.now()}`, listingId, reason, by: 'Dawit M.', when: 'Just now', open: true }, ...rs]),
      closeReport: (id) => setReports((rs) => rs.map((r) => (r.id === id ? { ...r, open: false } : r))),
      convos,
      startConvo: (listingId, sellerId) => {
        const existing = convos.find((c) => c.listingId === listingId);
        if (existing) return existing.id;
        const id = `c${Date.now()}`;
        setConvos((cs) => [{ id, listingId, sellerId, unread: 0, messages: [] }, ...cs]);
        return id;
      },
      sendMessage: (convoId, text) => {
        setConvos((cs) => cs.map((c) => (c.id === convoId ? { ...c, messages: [...c.messages, { me: true, text, time: now() }] } : c)));
        setTimeout(() => {
          setConvos((cs) =>
            cs.map((c) =>
              c.id === convoId
                ? { ...c, messages: [...c.messages, { me: false, text: AUTO_REPLIES[c.messages.length % AUTO_REPLIES.length], time: now() }] }
                : c,
            ),
          );
        }, 1400);
      },
      markRead: (convoId) => setConvos((cs) => cs.map((c) => (c.id === convoId && c.unread ? { ...c, unread: 0 } : c))),
      users,
      toggleUser: (id) => setUsers((us) => us.map((u) => (u.id === id ? { ...u, suspended: !u.suspended } : u))),
      deliveries,
      placeOrder: (o) => {
        const now = Date.now();
        const id = `D-${24830 + deliveries.length}`;
        const intercity = quote(o.listing.cat, pickupFor(o.listing), o.dropoff, o.speed).intercity;
        const busy = new Set(
          deliveries.filter((d) => d.riderId && !d.cancelled && track(d, now).stage !== 'delivered').map((d) => d.riderId as string),
        );
        // Dispatch is simulated: a rider accepts a few seconds after the order, then the trip plays out in about a minute.
        const d = makeDelivery({
          id,
          listing: o.listing,
          dropoff: o.dropoff,
          note: o.note,
          buyer: 'Dawit Mekonnen',
          phone: o.phone,
          mine: true,
          speed: o.speed,
          payment: o.payment,
          createdAt: now,
          assignedAt: now + 6000,
          riderId: pickRider(o.listing.cat, o.listing.city, intercity, busy),
          toPickupMs: 20_000,
          toDropMs: intercity ? 26 * 3600_000 : 60_000,
        });
        setDeliveries((ds) => [d, ...ds]);
        return id;
      },
      assignRider: (id, riderId) =>
        setDeliveries((ds) => ds.map((d) => (d.id === id ? { ...d, riderId, assignedAt: Date.now() } : d))),
      cancelDelivery: (id) => setDeliveries((ds) => ds.map((d) => (d.id === id ? { ...d, cancelled: true } : d))),
      rateDelivery: (id, stars) => setDeliveries((ds) => ds.map((d) => (d.id === id ? { ...d, rating: stars } : d))),
    }),
    [lang, t, listings, favs, user, toast, reports, convos, users, deliveries],
  );

  return (
    <Ctx.Provider value={store}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8" role="status" aria-live="polite">
        {toasts.map((x) => (
          <div key={x.id} className="animate-toast flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lift">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500">
              <Check size={13} strokeWidth={3} />
            </span>
            {x.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

/** True for a short moment after `key` changes, so screens can show skeletons. */
export function useFakeLoad(key: string, ms = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(id);
  }, [key, ms]);
  return loading;
}

export const fmt = (n: number) => n.toLocaleString('en-US');

/** Current time, ticking. Null until mounted, so time-based text never mismatches the server render. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
