/**
 * RideFlow High-Performance Interactive Map Component
 * Powered by Leaflet & OpenStreetMap with custom markers, polylines, and smooth tracking
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, MapPin, Compass, Car, Crosshair } from 'lucide-react';

interface InteractiveMapProps {
  pickup?: { lat: number; lng: number; address?: string } | null;
  dropoff?: { lat: number; lng: number; address?: string } | null;
  captainCoords?: { lat: number; lng: number } | null;
  nearbyCaptains?: { id: string; lat: number; lng: number; angle?: number }[];
  isSelectingPoint?: 'pickup' | 'dropoff' | null;
  onSelectCoordinates?: (coords: { lat: number; lng: number }) => void;
  className?: string;
  zoom?: number;
  center?: [number, number];
  interactive?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickup,
  dropoff,
  captainCoords,
  nearbyCaptains = [],
  isSelectingPoint,
  onSelectCoordinates,
  className = 'h-full w-full',
  zoom = 13,
  center = [37.7749, -122.4194], // San Francisco Metro default
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const captainMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const nearbyMarkersRef = useRef<L.Marker[]>([]);

  const [locatingUser, setLocatingUser] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark sleek OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Handle map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onSelectCoordinates) {
        onSelectCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update pickup marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    if (pickup) {
      const pickupIcon = L.divIcon({
        className: 'custom-pin-pickup',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-ping"></span>
            <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              ●
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup(pickup.address || 'Pickup Location');
    }
  }, [pickup?.lat, pickup?.lng, pickup?.address]);

  // Update dropoff marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }

    if (dropoff) {
      const dropoffIcon = L.divIcon({
        className: 'custom-pin-dropoff',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-md bg-neutral-900 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              ■
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      dropoffMarkerRef.current = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
        .addTo(map)
        .bindPopup(dropoff.address || 'Destination');
    }
  }, [dropoff?.lat, dropoff?.lng, dropoff?.address]);

  // Update Captain vehicle marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (captainCoords) {
      if (!captainMarkerRef.current) {
        const carIcon = L.divIcon({
          className: 'custom-pin-captain',
          html: `
            <div class="w-9 h-9 rounded-full bg-neutral-900 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-400 transition-transform duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        captainMarkerRef.current = L.marker([captainCoords.lat, captainCoords.lng], {
          icon: carIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      } else {
        captainMarkerRef.current.setLatLng([captainCoords.lat, captainCoords.lng]);
      }
    } else if (captainMarkerRef.current) {
      captainMarkerRef.current.remove();
      captainMarkerRef.current = null;
    }
  }, [captainCoords?.lat, captainCoords?.lng]);

  // Draw Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (pickup && dropoff) {
      // Draw realistic curve or direct line connecting pickup and dropoff
      const midLat = (pickup.lat + dropoff.lat) / 2 + 0.002;
      const midLng = (pickup.lng + dropoff.lng) / 2 - 0.002;

      const pathPoints: [number, number][] = [
        [pickup.lat, pickup.lng],
        [midLat, midLng],
        [dropoff.lat, dropoff.lng],
      ];

      routeLineRef.current = L.polyline(pathPoints, {
        color: '#171717',
        weight: 4,
        opacity: 0.85,
        dashArray: '1, 6',
      }).addTo(map);

      // Fit bounds nicely with padding
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng],
      ]);
      if (captainCoords) {
        bounds.extend([captainCoords.lat, captainCoords.lng]);
      }
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  // Nearby idle captains markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous
    nearbyMarkersRef.current.forEach((m) => m.remove());
    nearbyMarkersRef.current = [];

    if (!pickup || !dropoff) {
      nearbyCaptains.forEach((cap) => {
        const icon = L.divIcon({
          className: 'custom-pin-nearby',
          html: `
            <div class="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-600 shadow-md flex items-center justify-center text-neutral-300 opacity-80 hover:opacity-100">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="8"/>
              </svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const marker = L.marker([cap.lat, cap.lng], { icon }).addTo(map);
        nearbyMarkersRef.current.push(marker);
      });
    }
  }, [nearbyCaptains, pickup, dropoff]);

  // Locate Current User GPS
  const handleLocateMe = () => {
    setLocatingUser(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setLocatingUser(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocatingUser(false);
        const map = mapInstanceRef.current;
        if (map) {
          map.setView([lat, lng], 15);
        }
        if (onSelectCoordinates) {
          onSelectCoordinates({ lat, lng });
        }
      },
      () => {
        setLocatingUser(false);
        // Fallback gracefully to default downtown SF
        const map = mapInstanceRef.current;
        if (map) {
          map.setView([37.7749, -122.4194], 14);
        }
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className={`relative ${className} overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900`}>
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Mode Indicator if user is clicking on map to choose location */}
      {isSelectingPoint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-neutral-900/95 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-xl border border-neutral-700 flex items-center gap-2 backdrop-blur-sm">
          <Crosshair className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>Click anywhere on the map to set your {isSelectingPoint === 'pickup' ? 'pickup point' : 'destination'}</span>
        </div>
      )}

      {/* Locate Me Button */}
      <button
        onClick={handleLocateMe}
        disabled={locatingUser}
        title="Find My Location"
        className="absolute bottom-6 right-4 z-[400] bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 p-2.5 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <Navigation className={`w-4 h-4 ${locatingUser ? 'animate-spin text-emerald-500' : ''}`} />
      </button>
    </div>
  );
};
