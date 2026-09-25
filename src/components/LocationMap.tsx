'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10.9 12.4 23.4 14.4 25.4a.8.8 0 0 0 1.2 0C17.6 38.4 30 25.9 30 15 30 6.7 23.3 0 15 0z" fill="#1b4332"/>
    <circle cx="15" cy="15" r="6" fill="#faf7f0"/>
  </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 38],
});

// Roughly centered on the continent so the map is usable before a pin is set,
// wherever the PAU campus in question is.
const FALLBACK_CENTER: [number, number] = [9, 18];
const FALLBACK_ZOOM = 3;

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 15));
    }
  }, [lat, lng, map]);
  return null;
}

export function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Your browser does not support geolocation.');
      return;
    }
    setGeoError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setGeoError('Could not get your location. Tap the map to drop a pin instead.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onChange]);

  return (
    <div>
      <div className="rounded overflow-hidden border border-ink/15 h-56 relative z-0">
        <MapContainer
          center={lat != null && lng != null ? [lat, lng] : FALLBACK_CENTER}
          zoom={lat != null && lng != null ? 16 : FALLBACK_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          <Recenter lat={lat} lng={lng} />
          {lat != null && lng != null && <Marker position={[lat, lng]} icon={pinIcon} />}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between mt-2 gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          className="text-xs font-medium text-forest-600 hover:underline shrink-0"
        >
          {locating ? 'Locating…' : 'Use my current location'}
        </button>
        {lat != null && lng != null ? (
          <span className="text-xs text-ink/40 truncate">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        ) : (
          <span className="text-xs text-ink/40 truncate">Tap the map to drop a pin</span>
        )}
      </div>
      {geoError && <p className="text-xs text-clay-500 mt-1">{geoError}</p>}
    </div>
  );
}

export function LocationView({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  return (
    <div>
      <div className="rounded overflow-hidden border border-ink/15 h-40 relative z-0">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[lat, lng]} icon={pinIcon} />
        </MapContainer>
      </div>
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium text-forest-600 hover:underline mt-2 inline-block"
      >
        Open {label || 'meeting point'} in Maps
      </a>
    </div>
  );
}
