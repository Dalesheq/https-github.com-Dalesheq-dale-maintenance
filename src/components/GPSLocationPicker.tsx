import React, { useState } from 'react';
import { MapPin, Navigation, Check, Building2, RefreshCw } from 'lucide-react';
import { GPSLocation } from '../types';

interface GPSLocationPickerProps {
  currentGps: GPSLocation;
  onChange: (gps: GPSLocation) => void;
}

// Pre-calibrated factory premises coordinates for Dale Automation installations
const FACILITY_PRESETS: Array<{
  name: string;
  location: string;
  lat: number;
  lng: number;
  alt: number;
}> = [
  {
    name: 'Albany Bakeries - Pietermaritzburg Facility',
    location: 'Albany Pietermaritzburg, KwaZulu-Natal',
    lat: -29.6168,
    lng: 30.3928,
    alt: 654,
  },
  {
    name: 'Premier Foods - Blue Ribbon Aeroton Plant 2',
    location: 'Blue Ribbon Aeroton, Johannesburg',
    lat: -26.2573,
    lng: 27.9892,
    alt: 1720,
  },
  {
    name: 'Premier Foods - Blue Ribbon Middelburg Bakery',
    location: 'Middelburg, Mpumalanga',
    lat: -25.7675,
    lng: 29.4648,
    alt: 1490,
  },
  {
    name: 'Goldi Poultry - Standerton Processing Plant',
    location: 'Standerton, Mpumalanga',
    lat: -26.9497,
    lng: 29.2435,
    alt: 1530,
  },
  {
    name: 'Sasko Duens Bakery - Epping',
    location: 'Epping Industrial, Cape Town, Western Cape',
    lat: -33.9312,
    lng: 18.5367,
    alt: 45,
  },
  {
    name: 'Sunbake Bakeries - Benoni Plant',
    location: 'Benoni Industrial Sites, Gauteng',
    lat: -26.1887,
    lng: 28.3206,
    alt: 1640,
  },
  {
    name: 'Snackworks - Isando Biscuit Plant',
    location: 'Isando, Kempton Park, Gauteng',
    lat: -26.1412,
    lng: 28.2045,
    alt: 1680,
  },
  {
    name: 'Blue Ribbon Mthatha Bakery',
    location: 'Mthatha, Eastern Cape',
    lat: -31.5892,
    lng: 28.7844,
    alt: 698,
  },
];

export const GPSLocationPicker: React.FC<GPSLocationPickerProps> = ({ currentGps, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const acquireGPS = () => {
    setIsLocating(true);
    setErrorMsg(null);

    if (!('geolocation' in navigator)) {
      setErrorMsg('Geolocation is not supported by this browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : currentGps.altitude,
          facilityName: currentGps.facilityName || 'Current Site Location',
          address: currentGps.address || 'Acquired via device GPS sensor',
          timestamp: new Date().toISOString(),
        });
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg(`GPS signal unavailable: ${err.message}. Select factory preset below.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const selectPreset = (preset: (typeof FACILITY_PRESETS)[0]) => {
    onChange({
      latitude: preset.lat,
      longitude: preset.lng,
      accuracy: 3.5,
      altitude: preset.alt,
      facilityName: preset.name,
      address: preset.location,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-rose-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            GPS Site Verification &amp; Geotag
          </h4>
        </div>

        <button
          type="button"
          onClick={acquireGPS}
          disabled={isLocating}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-600" />
              Acquiring Satellites...
            </>
          ) : (
            <>
              <Navigation className="h-3.5 w-3.5 text-blue-600" />
              Capture Live Device GPS
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          {errorMsg}
        </div>
      )}

      {/* Current GPS Readout */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600">Facility / Industrial Site</label>
          <input
            type="text"
            value={currentGps.facilityName}
            onChange={(e) => onChange({ ...currentGps, facilityName: e.target.value })}
            placeholder="e.g. Albany Bakeries - Pietermaritzburg Facility"
            className="mt-0.5 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600">Latitude / Longitude</label>
          <div className="mt-0.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-mono-numbers text-slate-800">
            {currentGps.latitude.toFixed(4)}, {currentGps.longitude.toFixed(4)}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600">Accuracy &amp; Alt</label>
          <div className="mt-0.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-mono-numbers text-slate-800">
            ±{currentGps.accuracy}m · {currentGps.altitude ? `${currentGps.altitude}m ASL` : 'Ground'}
          </div>
        </div>
      </div>

      {/* Quick Plant Presets */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
          <Building2 className="h-3.5 w-3.5" />
          Quick Customer Facility Presets (for basements / cold stores without GPS):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FACILITY_PRESETS.map((p) => {
            const isSelected = currentGps.facilityName.includes(p.name.split(' - ')[0]);
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => selectPreset(p)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.name.split(' - ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
