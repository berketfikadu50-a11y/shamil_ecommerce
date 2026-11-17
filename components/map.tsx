'use client';

import dynamic from 'next/dynamic';

// Client-only: Leaflet needs the browser. A shimmer fills the box while it loads.
export const DeliveryMap = dynamic(() => import('./map-inner'), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

export type { MapLine, MapMarker, MapZone } from './map-inner';
