# Shamil Shop demo

A clickable sales prototype of a classifieds marketplace for Ethiopia. Everything runs in the browser with sample data: there is no backend, no database and no real payments.

## Run it

You need Node.js 18.18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. For the phone view, open your browser's device toolbar and pick a 390px-wide phone.

To serve an optimized build instead:

```bash
npm run build
npm start
```

## Demo script

1. **Home** (`/`): search, tap a category, swipe the Featured row.
2. **Vehicles** (`/category/vehicles`): toggle the quick chips, open Filters, change the sort order.
3. **Listing**: swipe the photos, tap Save, Share, Report, Call, Telegram and Chat.
4. **Post an ad** (`/post`): go through the five steps. The ad lands in Profile under Pending.
5. **Admin** (`/admin`): open Pending ads and approve the ad you just posted. It now appears on the home page.
6. **Promote**: from Profile, tap Promote on an ad, pick a package and pay with Telebirr or Chapa (mock).
7. **Delivery**: open a phone, electronics, furniture or fashion listing and tap **Get it delivered**. Set the drop-off by tapping the map, dragging the house pin, choosing an area or using your current location. The fee is calculated from the road distance. After **Place order**, the tracking page shows a rider being assigned, collecting the item and riding to you, in about a minute and a half. Rate the delivery at the end. Past and live orders are under Profile → My deliveries.
8. **Delivery admin** (`/admin/deliveries`): a live map of every active delivery, rider assignment for orders waiting for a rider, the rider list, and delivery zones with their prices.
9. **Login** (`/login`): any phone number, any 6-digit code.
10. Switch between English, አማርኛ and Afaan Oromoo in the header at any point.

## Good to know

- State lives in memory. Refreshing the page resets favorites, posted ads and admin actions.
- Listing photos are in `public/listings`, named `<listing id>-<number>.jpg` (for example `v1-1.jpg`), and listed per listing in `lib/photos.json`. To use your own photo, replace the file with one of the same name, or add a file and its path to `lib/photos.json`. A listing with no photos shows a tinted placeholder.
- The bundled photos come from Wikimedia Commons under free licenses. Author, license and source for each file are in `public/listings/credits.json`; keep that attribution if you publish the demo.
- Photos you add while posting an ad are previewed locally and never uploaded.
- The admin "Categories" visibility switches are illustrative and do not hide categories on the site.
- The dashboard's total and daily counts sit on a fixed base number so they look like a live marketplace; Pending and Reported are real counts from the demo data.
- Fonts load from Google Fonts, so the first load needs an internet connection to look right.
- **Delivery is simulated.** Rider dispatch and movement are played back on a timer, and the route drawn on the map is a smooth curve, not a real road route. Distances are straight-line distance × 1.35. Pricing, zones and riders are in `lib/delivery.ts`.
- **Map tiles come from OpenStreetMap's public tile server**, which is fine for a demo but not allowed for production traffic. A real launch needs a tile provider (for example Mapbox, MapTiler or Stadia Maps) and a routing service for real road distances and routes.
- "Use my current location" asks the browser for location permission. If you are outside a delivery zone, the page says delivery isn't available there.

## Where things are

| Path | What it holds |
| --- | --- |
| `lib/data.ts` | All sample listings, sellers, chats, reports and packages |
| `lib/i18n.ts` | Amharic and Afaan Oromoo translations of the UI labels |
| `lib/store.tsx` | In-memory app state (language, favorites, login, ads, chats, deliveries, toasts) |
| `lib/delivery.ts` | Delivery zones, pricing, riders, routes and the simulated tracking |
| `components/map-inner.tsx` | The Leaflet map used for checkout, tracking and the admin live map |
| `components/` | Shared UI: cards, sheets, header, tab bar |
| `app/(site)/` | Buyer and seller screens |
| `app/admin/` | Admin panel |
