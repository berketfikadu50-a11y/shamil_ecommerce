// Location-based delivery: zones, pricing, riders, routes and simulated tracking.
// Everything is computed in the browser; there is no routing or dispatch server.
import { ADDIS, LISTINGS, type Cat, type Listing } from './data';

export type LatLng = [number, number];
export type Speed = 'standard' | 'express' | 'intercity';
export type Stage = 'placed' | 'assigned' | 'on_the_way' | 'delivered' | 'cancelled';

// Approximate centre of each sub-city and city used in the demo data.
export const PLACE_COORDS: Record<string, LatLng> = {
  Bole: [8.9958, 38.7893],
  CMC: [9.0213, 38.8441],
  Piassa: [9.0355, 38.7525],
  Kazanchis: [9.0157, 38.7672],
  Megenagna: [9.0206, 38.8013],
  Sarbet: [9.0003, 38.7366],
  Ayat: [9.0335, 38.8789],
  Lebu: [8.9528, 38.7187],
  Mekanisa: [8.9853, 38.7271],
  Gerji: [8.9986, 38.8139],
  Adama: [8.5408, 39.2696],
  'Bahir Dar': [11.5936, 37.3908],
  Hawassa: [7.0621, 38.4763],
};

// Areas riders cover. A drop-off outside every zone cannot be delivered.
export const ZONES: { city: string; center: LatLng; radiusKm: number }[] = [
  { city: 'Addis Ababa', center: [9.005, 38.79], radiusKm: 16 },
  { city: 'Adama', center: PLACE_COORDS.Adama, radiusKm: 10 },
  { city: 'Hawassa', center: PLACE_COORDS.Hawassa, radiusKm: 10 },
  { city: 'Bahir Dar', center: PLACE_COORDS['Bahir Dar'], radiusKm: 10 },
];

export const DELIVERABLE: Cat[] = ['phones', 'electronics', 'furniture', 'fashion'];

// Pricing, in ETB.
export const PRICING = {
  base: 60,
  perKm: 15,
  expressFactor: 1.6,
  intercityBase: 350,
  intercityPerKm: 2.2,
  largeItem: 250,
};
export const MIN_FEE = 75;

export const RIDERS = [
  { id: 'r1', name: 'Samuel Getachew', vehicle: 'Motorbike', plate: '3-A41782', rating: 4.9, trips: 1284, phone: '+251 912 330 418', city: 'Addis Ababa' },
  { id: 'r2', name: 'Natnael Bekele', vehicle: 'Motorbike', plate: '3-B20915', rating: 4.8, trips: 932, phone: '+251 913 772 605', city: 'Addis Ababa' },
  { id: 'r3', name: 'Ruth Assefa', vehicle: 'Motorbike', plate: '3-A77310', rating: 4.9, trips: 1517, phone: '+251 911 845 027', city: 'Addis Ababa' },
  { id: 'r4', name: 'Kidus Alemayehu', vehicle: 'Bajaj', plate: '3-C05561', rating: 4.7, trips: 611, phone: '+251 922 104 386', city: 'Addis Ababa' },
  { id: 'r5', name: 'Henok Wolde', vehicle: 'Van', plate: '3-B90244', rating: 4.8, trips: 408, phone: '+251 930 551 902', city: 'Addis Ababa' },
  { id: 'r6', name: 'Liya Mohammed', vehicle: 'Motorbike', plate: '3-A12075', rating: 4.6, trips: 377, phone: '+251 915 220 731', city: 'Adama' },
  { id: 'r7', name: 'Abenezer Tadesse', vehicle: 'Motorbike', plate: '3-A30418', rating: 4.8, trips: 296, phone: '+251 916 408 155', city: 'Hawassa' },
  { id: 'r8', name: 'Mulugeta Ayalew', vehicle: 'Motorbike', plate: '3-A55902', rating: 4.7, trips: 254, phone: '+251 918 663 470', city: 'Bahir Dar' },
  { id: 'r9', name: 'Getnet Ayele', vehicle: 'Intercity courier', plate: '3-D10233', rating: 4.8, trips: 1840, phone: '+251 911 309 884', city: 'Intercity' },
];
export type Rider = (typeof RIDERS)[number];
export const riderById = (id: string | null) => RIDERS.find((r) => r.id === id) ?? null;

// ---- Geometry

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003;
  return h;
};

export function haversineKm(a: LatLng, b: LatLng) {
  const r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r;
  const dLng = (b[1] - a[1]) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(x));
}

/** Straight-line distance stretched to approximate the road distance. */
export const roadKm = (a: LatLng, b: LatLng) => Math.max(0.8, Math.round(haversineKm(a, b) * 1.35 * 10) / 10);

export const zoneOf = (p: LatLng) => ZONES.find((z) => haversineKm(p, z.center) <= z.radiusKm) ?? null;

export function nearestPlace(p: LatLng) {
  let best = 'Bole';
  let bestKm = Infinity;
  for (const [name, c] of Object.entries(PLACE_COORDS)) {
    const d = haversineKm(p, c);
    if (d < bestKm) {
      bestKm = d;
      best = name;
    }
  }
  return best;
}

export const cityOf = (place: string) => (ADDIS.includes(place) ? 'Addis Ababa' : place);

/** Where a rider collects the item: near the seller's sub-city, nudged per listing so pins don't stack. */
export function pickupFor(l: Pick<Listing, 'id' | 'city'>): LatLng {
  const base = PLACE_COORDS[l.city] ?? PLACE_COORDS.Bole;
  const h = hash(l.id);
  return [base[0] + ((h % 97) / 97 - 0.5) * 0.01, base[1] + ((h % 89) / 89 - 0.5) * 0.01];
}

/** First suggested drop-off: a nearby sub-city in Addis, or the same city elsewhere. */
export function defaultDropoff(l: Pick<Listing, 'city'>): LatLng {
  if (ADDIS.includes(l.city)) return PLACE_COORDS[l.city === 'Kazanchis' ? 'Bole' : 'Kazanchis'];
  const c = PLACE_COORDS[l.city] ?? PLACE_COORDS.Bole;
  return [c[0] + 0.012, c[1] - 0.01];
}

// ---- Pricing

const round5 = (n: number) => Math.round(n / 5) * 5;

export interface Quote {
  ok: boolean;
  km: number;
  intercity: boolean;
  speed: Speed;
  fee: number;
  large: number;
  etaMin: number;
  standardFee: number;
  expressFee: number;
  standardEta: number;
  expressEta: number;
}

export function quote(cat: Cat, pickup: LatLng, dropoff: LatLng, speed: 'standard' | 'express'): Quote {
  const zone = zoneOf(dropoff);
  const km = roadKm(pickup, dropoff);
  const intercity = !!zone && zone.city !== zoneOf(pickup)?.city;
  const large = cat === 'furniture' ? PRICING.largeItem : 0;
  const standardFee = intercity
    ? round5(PRICING.intercityBase + PRICING.intercityPerKm * km)
    : round5(PRICING.base + PRICING.perKm * km);
  const expressFee = round5(standardFee * PRICING.expressFactor);
  const standardEta = intercity ? 36 * 60 : Math.round(40 + km * 5);
  const expressEta = Math.round(20 + km * 2.5);
  const s: Speed = intercity ? 'intercity' : speed;
  return {
    ok: !!zone,
    km,
    intercity,
    speed: s,
    large,
    standardFee,
    expressFee,
    standardEta,
    expressEta,
    fee: (s === 'express' ? expressFee : standardFee) + large,
    etaMin: s === 'express' ? expressEta : standardEta,
  };
}

// ---- Routes (a smooth curve standing in for the road route)

export function routePath(a: LatLng, b: LatLng, seed: string, n = 32): LatLng[] {
  const bend = ((hash(seed) % 9) - 4) / 16;
  const mid: LatLng = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const ctrl: LatLng = [mid[0] + (b[1] - a[1]) * bend, mid[1] - (b[0] - a[0]) * bend];
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1]] as LatLng;
  });
}

export function along(path: LatLng[], f: number): LatLng {
  const x = Math.min(Math.max(f, 0), 1) * (path.length - 1);
  const i = Math.min(Math.floor(x), path.length - 2);
  const r = x - i;
  return [path[i][0] + (path[i + 1][0] - path[i][0]) * r, path[i][1] + (path[i + 1][1] - path[i][1]) * r];
}

const upTo = (path: LatLng[], f: number): LatLng[] => [...path.slice(0, Math.floor(f * (path.length - 1)) + 1), along(path, f)];

// ---- Deliveries

export interface Delivery {
  id: string;
  listingId: string;
  cat: Cat;
  mine: boolean;
  buyer: string;
  phone: string;
  pickup: LatLng;
  pickupPlace: string;
  dropoff: LatLng;
  dropoffPlace: string;
  note: string;
  km: number;
  fee: number;
  speed: Speed;
  payment: string;
  createdAt: number;
  /** When the rider accepted. Null while waiting for dispatch; may be in the future for auto-dispatch. */
  assignedAt: number | null;
  riderId: string | null;
  toPickupMs: number;
  toDropMs: number;
  cancelled?: boolean;
  rating?: number;
}

export interface OrderInput {
  listing: Listing;
  dropoff: LatLng;
  note: string;
  phone: string;
  speed: 'standard' | 'express';
  payment: string;
}

export function pickRider(cat: Cat, pickupPlace: string, intercity: boolean, busy: Set<string>) {
  if (intercity) return 'r9';
  const city = cityOf(pickupPlace);
  if (city !== 'Addis Ababa') return RIDERS.find((r) => r.city === city)?.id ?? 'r9';
  if (cat === 'furniture') return 'r5';
  return ['r1', 'r2', 'r3', 'r4'].find((id) => !busy.has(id)) ?? 'r1';
}

export function makeDelivery(p: {
  id: string;
  listing: Listing;
  dropoff: LatLng;
  note: string;
  buyer: string;
  phone: string;
  mine: boolean;
  speed: 'standard' | 'express';
  payment: string;
  createdAt: number;
  assignedAt: number | null;
  riderId: string | null;
  toPickupMs: number;
  toDropMs: number;
  rating?: number;
}): Delivery {
  const pickup = pickupFor(p.listing);
  const q = quote(p.listing.cat, pickup, p.dropoff, p.speed);
  return {
    id: p.id,
    listingId: p.listing.id,
    cat: p.listing.cat,
    mine: p.mine,
    buyer: p.buyer,
    phone: p.phone,
    pickup,
    pickupPlace: p.listing.city,
    dropoff: p.dropoff,
    dropoffPlace: nearestPlace(p.dropoff),
    note: p.note,
    km: q.km,
    fee: q.fee,
    speed: q.speed,
    payment: p.payment,
    createdAt: p.createdAt,
    assignedAt: p.assignedAt,
    riderId: p.riderId,
    toPickupMs: p.toPickupMs,
    toDropMs: p.toDropMs,
    rating: p.rating,
  };
}

/** Where the rider starts from when they accept the job. */
function riderStart(d: Delivery): LatLng {
  const a = ((hash(d.id) % 360) * Math.PI) / 180;
  return [d.pickup[0] + Math.sin(a) * 0.012, d.pickup[1] + Math.cos(a) * 0.012];
}

export interface Tracking {
  stage: Stage;
  /** 0 to 1 across the whole order. */
  progress: number;
  riderPos: LatLng | null;
  remainingMs: number;
  times: { placed: number; assigned?: number; picked?: number; delivered?: number };
  toPickupPath: LatLng[];
  mainPath: LatLng[];
  driven: LatLng[];
}

/** Where an order is at a given moment. Progress is derived from time, so no timers are stored. */
export function track(d: Delivery, now: number): Tracking {
  const toPickupPath = routePath(riderStart(d), d.pickup, d.id + 'a', 16);
  const mainPath = routePath(d.pickup, d.dropoff, d.id);
  const times: Tracking['times'] = { placed: d.createdAt };
  const base = { toPickupPath, mainPath, times };
  const total = d.toPickupMs + d.toDropMs;

  if (d.cancelled) return { ...base, stage: 'cancelled', progress: 0, riderPos: null, remainingMs: 0, driven: [] };
  if (d.assignedAt == null || now < d.assignedAt) {
    return { ...base, stage: 'placed', progress: 0.04, riderPos: null, remainingMs: total, driven: [] };
  }

  times.assigned = d.assignedAt;
  times.picked = d.assignedAt + d.toPickupMs;
  times.delivered = times.picked + d.toDropMs;
  const t = now - d.assignedAt;
  const progress = 0.1 + 0.9 * Math.min(t / total, 1);

  if (t < d.toPickupMs) {
    return { ...base, stage: 'assigned', progress, riderPos: along(toPickupPath, t / d.toPickupMs), remainingMs: total - t, driven: [] };
  }
  if (t < total) {
    const f = (t - d.toPickupMs) / d.toDropMs;
    return { ...base, stage: 'on_the_way', progress, riderPos: along(mainPath, f), remainingMs: total - t, driven: upTo(mainPath, f) };
  }
  return { ...base, stage: 'delivered', progress: 1, riderPos: d.dropoff, remainingMs: 0, driven: mainPath };
}

// ---- Sample orders, placed relative to "now" so the demo always has live deliveries

export function seedDeliveries(now: number): Delivery[] {
  const min = 60_000;
  const day = 24 * 60 * min;
  const L = (id: string) => LISTINGS.find((l) => l.id === id)!;
  const at = (p: string, dLat = 0, dLng = 0): LatLng => [PLACE_COORDS[p][0] + dLat, PLACE_COORDS[p][1] + dLng];

  return [
    makeDelivery({
      id: 'D-24817', listing: L('ph1'), dropoff: at('Gerji', 0.004, 0.003), note: 'Behind Unity University, blue gate',
      buyer: 'Dawit Mekonnen', phone: '+251 911 000 000', mine: true, speed: 'express', payment: 'Telebirr',
      createdAt: now - 8 * min, assignedAt: now - 7 * min, riderId: 'r3', toPickupMs: 4 * min, toDropMs: 16 * min,
    }),
    makeDelivery({
      id: 'D-24790', listing: L('e3'), dropoff: at('Bole', -0.003, 0.002), note: 'Bole Atlas, Sunshine building, 4th floor',
      buyer: 'Dawit Mekonnen', phone: '+251 911 000 000', mine: true, speed: 'standard', payment: 'Cash on delivery',
      createdAt: now - 2 * day - 40 * min, assignedAt: now - 2 * day - 35 * min, riderId: 'r1', toPickupMs: 9 * min, toDropMs: 26 * min, rating: 5,
    }),
    makeDelivery({
      id: 'D-24822', listing: L('f1'), dropoff: at('Ayat', 0.003, -0.002), note: 'Ayat condominium, block 12',
      buyer: 'Meron Kebede', phone: '+251 912 448 210', mine: false, speed: 'standard', payment: 'Chapa',
      createdAt: now - 14 * min, assignedAt: now - 11 * min, riderId: 'r5', toPickupMs: 7 * min, toDropMs: 28 * min,
    }),
    makeDelivery({
      id: 'D-24825', listing: L('ph3'), dropoff: at('Sarbet', 0.002, 0.003), note: 'Near the Canadian embassy',
      buyer: 'Yared Haile', phone: '+251 913 205 774', mine: false, speed: 'express', payment: 'Telebirr',
      createdAt: now - 3 * min, assignedAt: now - 2 * min, riderId: 'r2', toPickupMs: 5 * min, toDropMs: 12 * min,
    }),
    makeDelivery({
      id: 'D-24828', listing: L('fa2'), dropoff: at('Kazanchis', -0.002, 0.001), note: 'Hotel road, second building on the left',
      buyer: 'Selamawit Girma', phone: '+251 914 330 652', mine: false, speed: 'standard', payment: 'Cash on delivery',
      createdAt: now - 2 * min, assignedAt: null, riderId: null, toPickupMs: 25_000, toDropMs: 70_000,
    }),
    makeDelivery({
      id: 'D-24829', listing: L('e1'), dropoff: at('Lebu', 0.003, 0.002), note: 'Lebu, next to the Varnero apartments',
      buyer: 'Fitsum Bekele', phone: '+251 917 512 089', mine: false, speed: 'standard', payment: 'Telebirr',
      createdAt: now - 5 * min, assignedAt: null, riderId: null, toPickupMs: 25_000, toDropMs: 80_000,
    }),
    makeDelivery({
      id: 'D-24801', listing: L('e4'), dropoff: at('Mekanisa', 0.002, -0.003), note: 'Abo church road',
      buyer: 'Hiwot Desta', phone: '+251 921 640 318', mine: false, speed: 'standard', payment: 'Chapa',
      createdAt: now - 300 * min, assignedAt: now - 290 * min, riderId: 'r4', toPickupMs: 8 * min, toDropMs: 22 * min,
    }),
  ];
}
