import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Info,
  Radio
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationService, POPULAR_CITIES, CityPreset } from '../services/locationService';
import { RecyclingCenter, WasteCategory } from '../types';
import { useToast } from '../context/ToastContext';
import { LiveGpsRadarFinder } from '../components/gps/LiveGpsRadarFinder';

// Fix Leaflet marker icons in React Vite builds
const customPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to smoothly recenter map when city/user position changes
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 12);
  }, [lat, lng, map]);
  return null;
};

export const CentersPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedCity, setSelectedCity] = useState<CityPreset>(POPULAR_CITIES[0]); // default to SF
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: POPULAR_CITIES[0].lat,
    lng: POPULAR_CITIES[0].lng
  });
  const [categoryFilter, setCategoryFilter] = useState<WasteCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showRadar, setShowRadar] = useState(false);

  // Filter centers based on current coords
  const centers = LocationService.getCenters(userCoords.lat, userCoords.lng, {
    categoryFilter,
    searchQuery
  });

  const requestGpsLocation = async () => {
    setIsLocating(true);
    showToast('Locating', 'Requesting GPS coordinates...', 'info');

    const pos = await LocationService.getUserPosition();
    setIsLocating(false);

    if (pos) {
      setUserCoords(pos);
      showToast('Location Updated', 'Found your current location coordinates!', 'success');
    } else {
      showToast(
        'GPS Unavailable',
        'Location permission denied or timed out. Please choose a city preset below.',
        'error'
      );
    }
  };

  const handleCityChange = (cityId: string) => {
    const city = POPULAR_CITIES.find((c) => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      setUserCoords({ lat: city.lat, lng: city.lng });
      showToast('Switched City', `Showing centers around ${city.name}`, 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Title & Location Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Nearby Recycling Centers
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Verified Map
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Locate drop-off depots for e-waste, hazardous batteries, composting, and standard recyclables.
          </p>
        </div>

        {/* Location selector / GPS button */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCity.id}
            onChange={(e) => handleCityChange(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {POPULAR_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                📍 {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={requestGpsLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-forest-900 dark:bg-emerald-600 text-white hover:bg-forest-800 transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>Use GPS</span>
          </button>

          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              showRadar
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 dark:bg-eco-darkSurface text-slate-700 dark:text-gray-300 border-eco-border dark:border-white/10 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showRadar ? 'Hide Radar' : 'Live Radar'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Live GPS Radar Finder */}
      {showRadar && (
        <div className="animate-fade-in-up">
          <LiveGpsRadarFinder
            onLocationUpdate={(pos) => {
              setUserCoords({ lat: pos.lat, lng: pos.lng });
            }}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, address, or accepted items..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-subtle"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-eco-darkSurface border border-eco-border dark:border-eco-darkBorder text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="All">All Waste Streams</option>
            <option value="Electronic waste">Electronic Waste & Gadgets</option>
            <option value="Batteries">Batteries & Hazardous</option>
            <option value="Organic / compostable">Organic Composting Hubs</option>
            <option value="Plastic">Plastics & Containers</option>
            <option value="Glass">Glass Depots</option>
            <option value="Metal">Metals & Aluminum</option>
          </select>
        </div>
      </div>

      {/* Main Map + List Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
        {/* Interactive OpenStreetMap (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-eco-border dark:border-eco-darkBorder shadow-card relative h-full">
          <MapContainer
            center={[userCoords.lat, userCoords.lng]}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <MapRecenter lat={userCoords.lat} lng={userCoords.lng} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {centers.map((center) => (
              <Marker
                key={center.id}
                position={[center.lat, center.lng]}
                icon={customPinIcon}
                eventHandlers={{
                  click: () => setSelectedCenter(center)
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h4 className="font-bold text-xs text-forest-950">{center.name}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{center.address}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-emerald-700">{center.distanceKm} km away</span>
                      <a
                        href={LocationService.getDirectionsUrl(center.lat, center.lng, center.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forest-900 font-bold underline"
                      >
                        Directions &rarr;
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating map banner notice */}
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] p-2.5 rounded-xl bg-white/95 dark:bg-eco-darkSurface/95 backdrop-blur-md border border-eco-border dark:border-eco-darkBorder shadow-lg text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              Showing verified sample drop-off stations in {selectedCity.name}
            </span>
          </div>
        </div>

        {/* Center List (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-eco-darkSurface rounded-2xl border border-eco-border dark:border-eco-darkBorder p-4 shadow-subtle flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-eco-border dark:border-eco-darkBorder">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Available Facilities ({centers.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Sorted by distance</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-eco-border/60 dark:divide-eco-darkBorder/60 pr-1 space-y-1">
            {centers.length > 0 ? (
              centers.map((center) => (
                <div
                  key={center.id}
                  onClick={() => setSelectedCenter(center)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                    selectedCenter?.id === center.id
                      ? 'bg-forest-50 dark:bg-forest-950/50 border border-emerald-300 dark:border-emerald-700'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      {center.name}
                    </h4>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {center.distanceKm} km
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{center.address}</span>
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{center.openingHours}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {center.categoriesAccepted.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {cat}
                      </span>
                    ))}
                    {center.categoriesAccepted.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5">
                        +{center.categoriesAccepted.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="pt-2 mt-2 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Partner</span>
                    </span>

                    <a
                      href={LocationService.getDirectionsUrl(center.lat, center.lng, center.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-forest-900 dark:text-emerald-300 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No recycling centers match your filters in this region.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
