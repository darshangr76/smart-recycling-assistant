import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Navigation,
  Crosshair,
  Compass,
  Radio,
  Locate,
  LocateFixed,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Play,
  Square,
  Sparkles,
  Info,
  Maximize2,
  Route,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { LocationService, LiveLocationData } from '../../services/locationService';
import { RecyclingCenter } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

interface LiveGpsTelemetry {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  cityName: string;
  source: 'navigator.geolocation' | 'simulated';
  status: 'idle' | 'acquiring' | 'locked' | 'watching' | 'denied' | 'error';
  errorMessage?: string;
}

export const LiveGpsRadarFinder: React.FC<{
  onLocationUpdate?: (data: LiveLocationData) => void;
  compact?: boolean;
}> = ({ onLocationUpdate, compact = false }) => {
  const { currentColor, settings, updateSettings } = useSettings();
  const { showToast } = useToast();

  const [telemetry, setTelemetry] = useState<LiveGpsTelemetry>({
    lat: settings.lastKnownCoords?.lat || 12.9716,
    lng: settings.lastKnownCoords?.lng || 77.5946,
    accuracy: 12,
    altitude: 920,
    altitudeAccuracy: 5,
    heading: 42,
    speed: 0,
    timestamp: Date.now(),
    cityName: settings.lastKnownCoords?.city || settings.municipality || 'Bengaluru',
    source: 'navigator.geolocation',
    status: 'idle'
  });

  const [isWatching, setIsWatching] = useState(false);
  const [nearbyCenters, setNearbyCenters] = useState<RecyclingCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [rangeFilterKm, setRangeFilterKm] = useState<number>(10);
  const [simulatedMode, setSimulatedMode] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<number | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sweepAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Update nearby centers whenever lat/lng changes
  const refreshCenters = useCallback((lat: number, lng: number) => {
    const centers = LocationService.getCenters(lat, lng);
    setNearbyCenters(centers);
    if (centers.length > 0 && !selectedCenter) {
      setSelectedCenter(centers[0]);
    }
  }, [selectedCenter]);

  // Initial load
  useEffect(() => {
    refreshCenters(telemetry.lat, telemetry.lng);
  }, []);

  // Request single GPS fix using navigator.geolocation
  const acquireGpsLock = useCallback(() => {
    if (!navigator.geolocation) {
      setTelemetry((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Geolocation is not supported by this browser.'
      }));
      showToast('GPS Unsupported', 'navigator.geolocation is not available on this device.', 'error');
      return;
    }

    setTelemetry((prev) => ({ ...prev, status: 'acquiring' }));
    showToast('Pinging Satellites', 'Requesting high-precision GPS lock via navigator.geolocation...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;
        const cityName = LocationService.getApproximateCityName(latitude, longitude);

        const newTelemetry: LiveGpsTelemetry = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 10),
          altitude: altitude ? Math.round(altitude) : null,
          altitudeAccuracy: altitudeAccuracy ? Math.round(altitudeAccuracy) : null,
          heading: heading ? Math.round(heading) : null,
          speed: speed ? parseFloat((speed * 3.6).toFixed(1)) : null, // m/s to km/h
          timestamp: position.timestamp || Date.now(),
          cityName,
          source: 'navigator.geolocation',
          status: 'locked'
        };

        setTelemetry(newTelemetry);
        refreshCenters(latitude, longitude);

        updateSettings({
          municipality: cityName,
          lastKnownCoords: { lat: latitude, lng: longitude, city: cityName }
        });

        if (onLocationUpdate) {
          onLocationUpdate({
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy || 10),
            cityName,
            isLive: true,
            timestamp: position.timestamp || Date.now()
          });
        }

        showToast('GPS Lock Acquired 🛰️', `Precision: ±${Math.round(accuracy)}m in ${cityName}`, 'success');
      },
      (error) => {
        console.warn('navigator.geolocation error:', error);
        let msg = 'Failed to acquire location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permission denied. Please allow location access in your address bar.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS satellite fix unavailable. You can use Simulated GPS Mode.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Satellite fix timed out. Retrying with fallback.';
        }

        setTelemetry((prev) => ({
          ...prev,
          status: 'denied',
          errorMessage: msg
        }));

        showToast('GPS Warning', msg, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }, [refreshCenters, updateSettings, onLocationUpdate, showToast]);

  // Continuous tracking toggle with navigator.geolocation.watchPosition
  const toggleLiveWatch = useCallback(() => {
    if (isWatching) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsWatching(false);
      setTelemetry((prev) => ({ ...prev, status: 'locked' }));
      showToast('GPS Watch Paused', 'Continuous satellite tracking stopped.', 'info');
    } else {
      if (!navigator.geolocation) {
        showToast('GPS Error', 'navigator.geolocation is not available.', 'error');
        return;
      }

      setIsWatching(true);
      setTelemetry((prev) => ({ ...prev, status: 'watching' }));
      showToast('Live Tracking Started 🛰️', 'Continuous navigator.geolocation.watchPosition active.', 'success');

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;
          const cityName = LocationService.getApproximateCityName(latitude, longitude);

          setTelemetry({
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy || 10),
            altitude: altitude ? Math.round(altitude) : null,
            altitudeAccuracy: altitudeAccuracy ? Math.round(altitudeAccuracy) : null,
            heading: heading ? Math.round(heading) : null,
            speed: speed ? parseFloat((speed * 3.6).toFixed(1)) : null,
            timestamp: position.timestamp || Date.now(),
            cityName,
            source: 'navigator.geolocation',
            status: 'watching'
          });

          refreshCenters(latitude, longitude);

          if (onLocationUpdate) {
            onLocationUpdate({
              lat: latitude,
              lng: longitude,
              accuracy: Math.round(accuracy || 10),
              cityName,
              isLive: true,
              timestamp: position.timestamp || Date.now()
            });
          }
        },
        (error) => {
          console.warn('watchPosition error:', error);
          setIsWatching(false);
          setTelemetry((prev) => ({
            ...prev,
            status: 'error',
            errorMessage: error.message
          }));
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
      );
    }
  }, [isWatching, refreshCenters, onLocationUpdate, showToast]);

  // Toggle simulated GPS movement for hackathon testing
  const toggleSimulatedGps = () => {
    if (simulatedMode) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setSimulatedMode(false);
      showToast('Simulated Mode Off', 'Reverting to browser satellite fix.', 'info');
    } else {
      if (isWatching && watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsWatching(false);
      }

      setSimulatedMode(true);
      showToast('Simulated GPS Active 🚀', 'Simulating walk/drive telemetry with heading & speed.', 'info');

      let angle = 0;
      const baseLat = telemetry.lat;
      const baseLng = telemetry.lng;

      simIntervalRef.current = window.setInterval(() => {
        angle = (angle + 12) % 360;
        const rad = (angle * Math.PI) / 180;
        const latOffset = Math.sin(rad) * 0.0035;
        const lngOffset = Math.cos(rad) * 0.0035;

        const simulatedLat = baseLat + latOffset;
        const simulatedLng = baseLng + lngOffset;

        setTelemetry((prev) => ({
          ...prev,
          lat: simulatedLat,
          lng: simulatedLng,
          accuracy: Math.round(6 + Math.random() * 4),
          altitude: Math.round(920 + Math.sin(rad) * 15),
          heading: Math.round((angle + 90) % 360),
          speed: parseFloat((14.5 + Math.sin(rad) * 3).toFixed(1)), // ~15 km/h
          timestamp: Date.now(),
          source: 'simulated',
          status: 'watching'
        }));

        refreshCenters(simulatedLat, simulatedLng);
      }, 1500);
    }
  };

  // Cleanup watchers on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Radar Canvas Sweep Animation
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) - 18;

      ctx.clearRect(0, 0, w, h);

      // Radar background circle
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fillStyle = '#060B14';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.stroke();

      // Range Rings (1/3, 2/3, 3/3 of maxR)
      const ringSteps = [0.33, 0.66, 1.0];
      ringSteps.forEach((step, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * step, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = idx === 2 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.12)';
        ctx.setLineDash(idx === 1 ? [4, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.stroke();

      // Rotating Radar Sweep Line & Sector
      sweepAngleRef.current = (sweepAngleRef.current + 0.035) % (Math.PI * 2);
      const angle = sweepAngleRef.current;

      const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      sweepGradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
      sweepGradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.15)');
      sweepGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.45, angle);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Sweep edge beam
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#34d399';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // Center Pin (User Location)
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Render Nearby Centers on the Radar
      nearbyCenters.slice(0, 6).forEach((center) => {
        const distKm = center.distanceKm ?? LocationService.calculateDistanceKm(telemetry.lat, telemetry.lng, center.lat, center.lng);
        // Normalize distance to radar range (e.g. rangeFilterKm = 10km)
        const normalizedDist = Math.min(distKm / rangeFilterKm, 1);
        const r = normalizedDist * maxR;

        // Calculate relative bearing angle
        const dLat = center.lat - telemetry.lat;
        const dLng = center.lng - telemetry.lng;
        const bearing = Math.atan2(dLat, dLng);

        const bx = cx + Math.cos(bearing) * r;
        const by = cy - Math.sin(bearing) * r; // invert y for screen space

        const isSelected = selectedCenter?.id === center.id;

        // Blip glow
        ctx.beginPath();
        ctx.arc(bx, by, isSelected ? 7 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#38bdf8' : '#34d399';
        ctx.shadowColor = isSelected ? '#38bdf8' : '#10b981';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(bx, by, 12, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [nearbyCenters, telemetry.lat, telemetry.lng, rangeFilterKm, selectedCenter]);

  // Copy coordinates helper
  const handleCopyCoords = () => {
    const text = `${telemetry.lat.toFixed(6)}, ${telemetry.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    showToast('Coordinates Copied', `${text} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Convert decimal to DMS string
  const toDms = (deg: number, isLat: boolean): string => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card border border-white/10 p-5 sm:p-6 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg animate-ring-pulse"
            style={{ backgroundColor: currentColor.hex }}
          >
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Live GPS Radar Finder
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-400">
                navigator.geolocation
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              High-precision satellite geolocation radar detecting nearby waste hubs in real time.
            </p>
          </div>
        </div>

        {/* Live Status Pill & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Signal Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                telemetry.status === 'watching'
                  ? 'bg-emerald-400 animate-ping'
                  : telemetry.status === 'locked'
                  ? 'bg-emerald-400'
                  : telemetry.status === 'acquiring'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-gray-400'
              }`}
            />
            <span className="font-semibold text-gray-300 capitalize">
              {telemetry.status === 'watching'
                ? 'Live Satellite Feed'
                : telemetry.status === 'locked'
                ? 'GPS Lock Active'
                : telemetry.status === 'acquiring'
                ? 'Acquiring Lock...'
                : 'Standby'}
            </span>
          </div>

          {/* Acquire / Refresh Lock */}
          <button
            onClick={acquireGpsLock}
            disabled={telemetry.status === 'acquiring'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:brightness-110 active:scale-95"
            style={{ backgroundColor: currentColor.hex }}
            title="Request fresh location using navigator.geolocation.getCurrentPosition()"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${telemetry.status === 'acquiring' ? 'animate-spin' : ''}`} />
            <span>Lock GPS</span>
          </button>

          {/* Continuous Tracking Toggle */}
          <button
            onClick={toggleLiveWatch}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isWatching
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title="Toggle continuous tracking via navigator.geolocation.watchPosition()"
          >
            {isWatching ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isWatching ? 'Stop Watch' : 'Live Watch'}</span>
          </button>

          {/* Simulation Toggle (for hackathon demo) */}
          <button
            onClick={toggleSimulatedGps}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              simulatedMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
            title="Simulate GPS movement for testing"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{simulatedMode ? 'Sim Active' : 'Demo Sim'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Screen (Left) + Telemetry Data Hub (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
        {/* RADAR CANVAS SCREEN (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-black/40 border border-white/10 relative">
          <div className="relative">
            <canvas
              ref={radarCanvasRef}
              width={280}
              height={280}
              className="rounded-full shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            />
            {/* Top North Indicator */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-emerald-400/80 bg-black/60 px-1.5 rounded">
              N 0°
            </div>
            {/* East / South / West Indicators */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-gray-500">
              E
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-gray-500">
              S
            </div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-gray-500">
              W
            </div>
          </div>

          {/* Radar Range Controls */}
          <div className="flex items-center justify-between w-full mt-3 px-2 text-[10px]">
            <span className="text-gray-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-emerald-400" />
              Radar Radius:
            </span>
            <div className="flex items-center gap-1">
              {[5, 10, 25].map((km) => (
                <button
                  key={km}
                  onClick={() => setRangeFilterKm(km)}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition-colors ${
                    rangeFilterKm === km
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TELEMETRY READOUT & SATELLITE HUD (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Coordinates Card */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Realtime Position Telemetry
                </span>
              </div>
              <button
                onClick={handleCopyCoords}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-white transition-colors"
                title="Copy Lat, Lng"
              >
                {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoords ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Decimal Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Latitude</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {telemetry.lat.toFixed(6)}°
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                  {toDms(telemetry.lat, true)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Longitude</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {telemetry.lng.toFixed(6)}°
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                  {toDms(telemetry.lng, false)}
                </span>
              </div>
            </div>

            {/* Extra Telemetry: Accuracy, Altitude, Speed, Heading */}
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/5 text-[11px]">
              <div>
                <span className="text-[10px] text-gray-500 block">Accuracy</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ±{telemetry.accuracy}m
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block">Altitude</span>
                <span className="font-bold text-white font-mono">
                  {telemetry.altitude !== null ? `${telemetry.altitude}m` : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block">Speed</span>
                <span className="font-bold text-white font-mono">
                  {telemetry.speed !== null ? `${telemetry.speed} km/h` : '0 km/h'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block">Heading</span>
                <span className="font-bold text-white font-mono">
                  {telemetry.heading !== null ? `${telemetry.heading}°` : '0° N'}
                </span>
              </div>
            </div>
          </div>

          {/* Nearest Detected Center Quick Action */}
          {selectedCenter && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/25 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Nearest Hub Detected
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {selectedCenter.distanceKm ?? LocationService.calculateDistanceKm(telemetry.lat, telemetry.lng, selectedCenter.lat, selectedCenter.lng)} km away
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate mt-1">
                  {selectedCenter.name}
                </h4>
                <p className="text-[11px] text-gray-400 truncate">
                  {selectedCenter.address}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <a
                  href={LocationService.getDirectionsUrl(selectedCenter.lat, selectedCenter.lng, selectedCenter.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all"
                  style={{ backgroundColor: currentColor.hex }}
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Radar Blip Directory (Horizontal Scroll List) */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nearby Classified Drop-off Depots ({nearbyCenters.length} detected)</span>
          </span>
          <span className="text-[11px] text-gray-500">Click a hub to focus on radar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {nearbyCenters.slice(0, 3).map((center) => {
            const isSelected = selectedCenter?.id === center.id;
            const dist = center.distanceKm ?? LocationService.calculateDistanceKm(telemetry.lat, telemetry.lng, center.lat, center.lng);
            return (
              <div
                key={center.id}
                onClick={() => setSelectedCenter(center)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg scale-[1.02]'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white truncate max-w-[150px]">{center.name}</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-[11px] shrink-0">
                    {dist} km
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 line-clamp-1">{center.address}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[9px] text-gray-500">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300">
                    {center.categoriesAccepted.slice(0, 2).join(', ')}
                  </span>
                  {center.categoriesAccepted.length > 2 && (
                    <span>+{center.categoriesAccepted.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
