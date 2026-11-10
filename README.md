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
7. **Login** (`/login`): any phone number, any 6-digit code.
8. Switch between EN and አማርኛ in the header at any point.

## Good to know

- State lives in memory. Refreshing the page resets favorites, posted ads and admin actions.
- Listing photos are generated placeholders. Photos you add while posting an ad are previewed locally and never uploaded.
- The admin "Categories" visibility switches are illustrative and do not hide categories on the site.
- The dashboard's total and daily counts sit on a fixed base number so they look like a live marketplace; Pending and Reported are real counts from the demo data.
- Fonts load from Google Fonts, so the first load needs an internet connection to look right.

## Where things are

| Path | What it holds |
| --- | --- |
| `lib/data.ts` | All sample listings, sellers, chats, reports and packages |
| `lib/i18n.ts` | Amharic translations of the UI labels |
| `lib/store.tsx` | In-memory app state (language, favorites, login, ads, chats, toasts) |
| `components/` | Shared UI: cards, sheets, header, tab bar |
| `app/(site)/` | Buyer and seller screens |
| `app/admin/` | Admin panel |
