'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { IActivity } from '@/types';

interface MapPoint {
  activity: IActivity;
  dayLabel: string;
}

interface MapViewProps {
  points: MapPoint[];
  mapboxToken?: string;
}

export function MapView({ points, mapboxToken }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapboxToken || !containerRef.current || points.length === 0) return;

    let map: import('mapbox-gl').Map | undefined;
    let cancelled = false;

    (async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = mapboxToken;

        const coordinates = points.map((p) => [p.activity.lng as number, p.activity.lat as number] as [number, number]);
        const [firstLng, firstLat] = coordinates[0] ?? [90.4125, 23.8103];

        map = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [firstLng, firstLat],
          zoom: 11
        });

        map.on('load', () => {
          if (!map) return;

          // Route polyline connecting activities in itinerary order.
          if (coordinates.length > 1) {
            map.addSource('route', {
              type: 'geojson',
              data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
            });
            map.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#E85D75', 'line-width': 3, 'line-dasharray': [1, 1] }
            });
          }

          const bounds = new mapboxgl.LngLatBounds();
          points.forEach((point, index) => {
            const el = document.createElement('div');
            el.style.cssText =
              'width:28px;height:28px;border-radius:50%;background:#E85D75;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);';
            el.textContent = String(index + 1);

            const popupHtml = `<strong>${escapeHtml(point.activity.title)}</strong><br/>${escapeHtml(point.dayLabel)} · ${escapeHtml(
              point.activity.time
            )}`;

            new mapboxgl.Marker({ element: el })
              .setLngLat([point.activity.lng as number, point.activity.lat as number])
              .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(popupHtml))
              .addTo(map!);

            bounds.extend([point.activity.lng as number, point.activity.lat as number]);
          });

          if (points.length > 1) {
            map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
          }
        });
      } catch (err) {
        console.error('[MAP_LOAD_ERROR]', err);
        setLoadError('Could not load the map. Please check your connection and Mapbox token.');
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [mapboxToken, points]);

  if (!mapboxToken) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 py-16 text-center">
        <MapPin className="h-8 w-8 text-primary" />
        <p className="font-heading text-xl font-semibold">Map needs a Mapbox token</p>
        <p className="max-w-sm text-sm text-ink/50">
          Add <code className="rounded bg-blush px-1.5 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your{' '}
          <code className="rounded bg-blush px-1.5 py-0.5">.env.local</code> to see activity locations plotted here.
        </p>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 py-16 text-center">
        <MapPin className="h-8 w-8 text-primary/40" />
        <p className="font-heading text-xl font-semibold">No locations plotted yet</p>
        <p className="max-w-sm text-sm text-ink/50">
          Add latitude/longitude to your activities (in the itinerary&apos;s &quot;Map coordinates&quot; field) to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl2 shadow-card">
      {loadError && <p className="bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/30 dark:text-red-400">{loadError}</p>}
      <div ref={containerRef} className="h-[480px] w-full" />
    </div>
  );
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}
