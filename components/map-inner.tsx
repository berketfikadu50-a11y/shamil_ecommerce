'use client';

// Leaflet touches `window`, so this file is only ever loaded on the client through components/map.tsx.
import L from 'leaflet';
import { useEffect } from 'react';
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import type { LatLng } from '@/lib/delivery';

export interface MapMarker {
  id: string;
  pos: LatLng;
  kind: 'pickup' | 'dropoff' | 'rider';
  tip?: string;
}
export interface MapLine {
  id: string;
  path: LatLng[];
  tone: 'planned' | 'driven' | 'approach' | 'route';
}
export interface MapZone {
  id: string;
  center: LatLng;
  radiusKm: number;
}
export interface MapProps {
  markers: MapMarker[];
  lines?: MapLine[];
  zones?: MapZone[];
  /** Points the view should frame. */
  fit: LatLng[];
  /** The view re-frames only when this changes, so a moving rider doesn't keep resetting the zoom. */
  fitKey: string;
  onPick?: (p: LatLng) => void;
  draggableId?: string;
}

const svg = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const GLYPH = {
  pickup:
    '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  dropoff:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  rider:
    '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
};

const ICONS = {
  pickup: L.divIcon({ className: '', html: `<div class="map-pin map-pin-pickup">${svg(GLYPH.pickup)}</div>`, iconSize: [38, 38], iconAnchor: [19, 19] }),
  dropoff: L.divIcon({ className: '', html: `<div class="map-pin map-pin-dropoff">${svg(GLYPH.dropoff)}</div>`, iconSize: [40, 40], iconAnchor: [20, 20] }),
  rider: L.divIcon({ className: 'rider-marker', html: `<div class="map-pin map-pin-rider">${svg(GLYPH.rider)}</div>`, iconSize: [42, 42], iconAnchor: [21, 21] }),
};

const LINE: Record<MapLine['tone'], L.PathOptions> = {
  planned: { color: '#0C6B40', weight: 5, opacity: 0.28 },
  driven: { color: '#0C6B40', weight: 5, opacity: 0.95 },
  route: { color: '#0C6B40', weight: 4, opacity: 0.85, dashArray: '1 9', lineCap: 'round' },
  approach: { color: '#14201A', weight: 3, opacity: 0.6, dashArray: '6 8' },
};

function Fit({ fit, fitKey }: { fit: LatLng[]; fitKey: string }) {
  const map = useMap();
  useEffect(() => {
    if (!fit.length) return;
    if (fit.length === 1) map.setView(fit[0], 14);
    else map.fitBounds(L.latLngBounds(fit), { padding: [44, 44], maxZoom: 15 });
    // Re-frame only when the key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map]);
  return null;
}

function Picker({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

export default function DeliveryMapInner({ markers, lines = [], zones = [], fit, fitKey, onPick, draggableId }: MapProps) {
  return (
    <MapContainer center={fit[0] ?? [9.01, 38.76]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        // OpenStreetMap's public tiles suit a demo. A production app needs its own tile provider (see README).
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {zones.map((z) => (
        <Circle
          key={z.id}
          center={z.center}
          radius={z.radiusKm * 1000}
          pathOptions={{ color: '#12824F', weight: 1.5, fillColor: '#12824F', fillOpacity: 0.05, dashArray: '4 6' }}
        />
      ))}
      {lines.map((l) => (
        <Polyline key={l.id} positions={l.path} pathOptions={LINE[l.tone]} />
      ))}
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={m.pos}
          icon={ICONS[m.kind]}
          zIndexOffset={m.kind === 'rider' ? 1000 : 0}
          draggable={m.id === draggableId}
          eventHandlers={
            m.id === draggableId && onPick
              ? {
                  dragend: (e) => {
                    const ll = (e.target as L.Marker).getLatLng();
                    onPick([ll.lat, ll.lng]);
                  },
                }
              : undefined
          }
        >
          {m.tip && (
            <Tooltip direction="top" offset={[0, -20]}>
              {m.tip}
            </Tooltip>
          )}
        </Marker>
      ))}
      <Fit fit={fit} fitKey={fitKey} />
      {onPick && <Picker onPick={onPick} />}
    </MapContainer>
  );
}
