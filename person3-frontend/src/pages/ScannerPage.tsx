import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Camera,
  RotateCcw,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Loader2,
  ShieldAlert,
  ChevronDown,
  Check,
  ScanLine,
  RefreshCw,
  SwitchCamera,
  Lock,
  Zap,
  Droplets,
  Scissors,
  ArrowRight
} from 'lucide-react';
import { AIService, DEMO_PRESETS, DemoPresetItem } from '../services/aiService';
import { ImpactService } from '../services/impactService';
import { RewardService } from '../services/rewardService';
import { WasteClassification, WasteCategory } from '../types';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

interface CameraErrorInfo {
  title: string;
  message: string;
  isBlocked?: boolean;
}

// Preset visual metadata with vibrant color schemes & icons for 100% reliable rendering
const PRESET_META: Record<
  string,
  { emoji: string; shortName: string; categoryLabel: string; bgGradient: string; badgeColor: string }
> = {
  'plastic-water-bottle': {
    emoji: '🥤',
    shortName: 'PET Bottle',
    categoryLabel: 'Plastic',
    bgGradient: 'from-blue-600/25 via-cyan-500/15 to-slate-900',
    badgeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
  },
  'aluminum-soda-can': {
    emoji: '🥫',
    shortName: 'Soda Can',
    categoryLabel: 'Metal',
    bgGradient: 'from-slate-500/25 via-slate-400/15 to-slate-900',
    badgeColor: 'text-slate-200 bg-slate-500/15 border-slate-400/30'
  },
  'banana-peel': {
    emoji: '🍌',
    shortName: 'Food Scraps',
    categoryLabel: 'Compost',
    bgGradient: 'from-emerald-600/25 via-lime-500/15 to-slate-900',
    badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
  },
  'lithium-ion-battery': {
    emoji: '🔋',
    shortName: 'Li-Ion Cell',
    categoryLabel: 'Battery',
    bgGradient: 'from-amber-600/25 via-rose-500/15 to-slate-900',
    badgeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/30'
  },
  'pizza-box-greasy': {
    emoji: '🍕',
    shortName: 'Pizza Box',
    categoryLabel: 'General',
    bgGradient: 'from-amber-700/25 via-orange-500/15 to-slate-900',
    badgeColor: 'text-orange-300 bg-orange-500/15 border-orange-500/30'
  },
  'cardboard-box': {
    emoji: '📦',
    shortName: 'Cardboard',
    categoryLabel: 'Paper',
    bgGradient: 'from-yellow-700/25 via-amber-600/15 to-slate-900',
    badgeColor: 'text-amber-200 bg-amber-600/15 border-amber-500/30'
  },
  'smartphone-device': {
    emoji: '📱',
    shortName: 'Phone E-Waste',
    categoryLabel: 'E-Waste',
    bgGradient: 'from-purple-600/25 via-indigo-500/15 to-slate-900',
    badgeColor: 'text-purple-300 bg-purple-500/15 border-purple-500/30'
  },
  'tetrapak-carton': {
    emoji: '🧃',
    shortName: 'Tetra Pak',
    categoryLabel: 'Composite',
    bgGradient: 'from-teal-600/25 via-emerald-500/15 to-slate-900',
    badgeColor: 'text-teal-300 bg-teal-500/15 border-teal-500/30'
  },
  'glass-jar': {
    emoji: '🫙',
    shortName: 'Glass Jar',
    categoryLabel: 'Glass',
    bgGradient: 'from-sky-600/25 via-blue-500/15 to-slate-900',
    badgeColor: 'text-sky-300 bg-sky-500/15 border-sky-500/30'
  }
};

/**
 * Robust Preset Thumbnail Card with guaranteed clean fallback
 */
const PresetCard: React.FC<{
  preset: DemoPresetItem;
  onClick: () => void;
}> = ({ preset, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const meta = PRESET_META[preset.id] || {
    emoji: '♻️',
    shortName: preset.name,
    categoryLabel: preset.category,
    bgGradient: 'from-emerald-600/20 to-slate-900',
    badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center p-3 rounded-2xl bg-slate-900/50 hover:bg-slate-800/70 border border-white/[0.07] hover:border-emerald-400/30 transition-all duration-200 text-left hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 text-center"
      title={`${preset.name} (${preset.category})`}
    >
      <div className={`w-full aspect-square rounded-xl mb-2.5 overflow-hidden relative flex items-center justify-center bg-gradient-to-br ${meta.bgGradient} border border-white/[0.06]`}>
        {/* Vector / Emoji Art fallback (always visible beneath or if image fails) */}
        <span className="text-3xl select-none group-hover:scale-110 transition-transform duration-200">
          {meta.emoji}
        </span>

        {/* Thumbnail overlay if URL is reachable */}
        {!imageError && preset.thumbnail && (
          <img
            src={preset.thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-90 group-hover:opacity-100 group-hover:scale-105' : 'opacity-0'
            }`}
          />
        )}
      </div>

      <span className="text-xs font-bold text-white truncate w-full group-hover:text-emerald-300 transition-colors">
        {meta.shortName}
      </span>
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border mt-1 font-semibold ${meta.badgeColor}`}>
        {meta.categoryLabel}
      </span>
    </button>
  );
};

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings, currentColor } = useSettings();
  const { t } = useLanguage();

  // Image & Scan State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<WasteClassification | null>(null);
  const [isLiveResult, setIsLiveResult] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasActionRecorded, setHasActionRecorded] = useState(false);
  const [showOverride, setShowOverride] = useState(false);

  // Edge Cases: Contamination & Multi-material states
  const [hasResidueWarning, setHasResidueWarning] = useState<boolean>(false);
  const [isRinsed, setIsRinsed] = useState<boolean>(false);
  const [isMultiMaterial, setIsMultiMaterial] = useState<boolean>(false);
  const [capSeparated, setCapSeparated] = useState<boolean>(false);
  const [bonusPointsEarned, setBonusPointsEarned] = useState<number>(0);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<CameraErrorInfo | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Evaluate Contamination & Multi-Material Edge Cases
  const checkEdgeCases = (data: WasteClassification) => {
    const nameLower = (data.itemName || '').toLowerCase();
    const isContainer =
      nameLower.includes('bottle') ||
      nameLower.includes('can') ||
      nameLower.includes('jar') ||
      nameLower.includes('carton') ||
      nameLower.includes('tetra') ||
      nameLower.includes('cup') ||
      nameLower.includes('box') ||
      nameLower.includes('tray') ||
      data.category === 'Plastic' ||
      data.category === 'Metal';

    const isComposite =
      nameLower.includes('tetra') ||
      nameLower.includes('carton') ||
      nameLower.includes('spout') ||
      nameLower.includes('multi-material');

    setHasResidueWarning(isContainer);
    setIsRinsed(false);
    setIsMultiMaterial(isComposite);
    setCapSeparated(false);
    setBonusPointsEarned(0);
  };

  const handleRinseContainer = () => {
    setIsRinsed(true);
    setBonusPointsEarned((prev) => prev + 10);
    RewardService.awardDirectPoints(10, 'Container Rinsed Bonus');
    RewardService.fireConfetti();
    showToast('Bonus Earned! 💧', '+10 Eco Points awarded for decontaminating container!', 'success');
  };

  const handleSeparateCap = () => {
    setCapSeparated(true);
    setBonusPointsEarned((prev) => prev + 5);
    RewardService.awardDirectPoints(5, 'Multi-Material Separation');
    RewardService.fireConfetti();
    showToast('Materials Separated! ✂️', '+5 Eco Points for separating plastic cap from carton.', 'success');
  };

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      mediaStreamRef.current = null;
    }
    setMediaStream(null);
    setIsCameraActive(false);
    setIsInitializingCamera(false);
  }, []);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevs.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Synchronize stream with video element whenever camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Auto-play blocked or failed:', err);
      });
    }
  }, [isCameraActive, mediaStream]);

  // Robust Camera Starter with fallback chain for localhost:5173
  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    setIsInitializingCamera(true);
    setResult(null);

    let stream: MediaStream | null = null;
    let lastError: any = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError({
        title: 'Camera API Unavailable',
        message: 'Your browser does not support HTML5 camera access or is in an insecure context.',
        isBlocked: false
      });
      setIsInitializingCamera(false);
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
    } catch (e1) {
      lastError = e1;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (e2) {
        lastError = e2;
      }
    }

    if (stream) {
      mediaStreamRef.current = stream;
      setMediaStream(stream);
      setIsCameraActive(true);
      setIsInitializingCamera(false);
      setCameraError(null);
      showToast('Camera Connected', 'Point camera at any waste item and click snap!', 'success');
    } else {
      setIsInitializingCamera(false);
      setIsCameraActive(false);

      if (lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError') {
        setCameraError({
          title: 'Camera Access Blocked for localhost:5173',
          message: 'Permission was blocked or dismissed. Please allow camera permissions in your browser URL bar for http://localhost:5173.',
          isBlocked: true
        });
        showToast('Camera Blocked', 'Please allow camera permission in your browser address bar.', 'warning');
      } else {
        setCameraError({
          title: 'Camera Unavailable',
          message: lastError?.message || 'Could not open video stream. You can upload an image instead.',
          isBlocked: false
        });
        showToast('Camera Error', 'Could not open camera stream.', 'error');
      }
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
          handleFileSelect(file);
        }
      }, 'image/jpeg', 0.92);
    }
    stopCamera();
  };

  const handleFileSelect = (file: File) => {
    const validation = AIService.validateImage(file);
    if (!validation.valid) {
      showToast('Invalid File', validation.error, 'error');
      return;
    }

    stopCamera();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setNotice(null);
    setHasActionRecorded(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const executeScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setNotice(null);

    try {
      const response = await AIService.classifyWaste(selectedFile);
      setResult(response.data);
      checkEdgeCases(response.data);
      setIsLiveResult(response.isLive);
      if (response.errorNotice) {
        setNotice(response.errorNotice);
      }
      showToast('Classification Ready', `Classified as ${response.data.itemName}`, 'success');
    } catch (err: any) {
      showToast('Classification Failed', err.message || 'Please try another photo.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const loadPreset = async (preset: DemoPresetItem) => {
    stopCamera();
    setPreviewUrl(preset.thumbnail);
    const presetFile = new File([], `${preset.name.toLowerCase().replace(/\s+/g, '-')}.jpg`, { type: 'image/jpeg' });
    setSelectedFile(presetFile);
    setIsLiveResult(false);
    setNotice('Analyzing with live backend...');
    setHasActionRecorded(false);
    showToast('Analyzing', preset.name, 'info');
    // Call the real backend with the preset's thumbnail
    try {
      const blob = await fetch(preset.thumbnail).then(r => r.blob());
      const liveFile = new File([blob], `${preset.name.toLowerCase().replace(/\s+/g, '-')}.jpg`, { type: blob.type || 'image/jpeg' });
      const response = await AIService.classifyWaste(liveFile);
      setResult(response.data);
      checkEdgeCases(response.data);
      setIsLiveResult(response.isLive);
      setNotice(response.errorNotice || null);
      showToast('Classification Ready', `Classified as ${response.data.itemName}`, 'success');
    } catch (err: any) {
      // Fallback to preset result if backend unreachable
      setResult({ ...preset.result, imageUrl: preset.thumbnail, timestamp: new Date().toISOString() });
      checkEdgeCases(preset.result);
      setNotice('Backend unreachable, showing preset demo: ' + preset.name);
      showToast('Fallback to Demo', err.message || 'Backend error', 'error');
    }
  };

  const confirmDisposal = () => {
    if (!result || hasActionRecorded) return;

    const recorded = ImpactService.recordScan(result, true);
    RewardService.awardPointsForEvent(
      recorded.id,
      RewardService.POINTS_PER_CONFIRMED_SORT,
      'Confirmed correct recycling'
    );

    setHasActionRecorded(true);
    RewardService.fireConfetti();

    showToast(
      'Action Logged! 🎉',
      `Earned +${RewardService.POINTS_PER_CONFIRMED_SORT} Eco Points. Diverted ${result.estimatedWeightKg || 0.05} kg from landfill!`,
      'success'
    );
  };

  const handleCategoryOverride = (newCat: WasteCategory) => {
    if (!result) return;
    setResult({
      ...result,
      category: newCat,
      confidence: 1.0,
      recyclable: !newCat.includes('non-recyclable')
    });
    setShowOverride(false);
    showToast('Category Updated', `Updated waste classification to ${newCat}`, 'info');
  };

  const clearSelection = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setNotice(null);
    setHasActionRecorded(false);
    setCameraError(null);
    setIsRinsed(false);
    setHasResidueWarning(false);
    setIsMultiMaterial(false);
    setCapSeparated(false);
    setBonusPointsEarned(0);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Page Header — Clean, Uncluttered */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <ScanLine className="w-7 h-7 text-emerald-400" />
            <span>{t('scanner.title')}</span>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              Vision Edge AI
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            {t('scanner.subtitle')}
          </p>
        </div>
      </div>

      {/* Camera Permission / Error Banner if blocked */}
      {cameraError && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 animate-slide-in">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center shrink-0 font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{cameraError.title}</h3>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">{cameraError.message}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startCamera()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Retry Camera
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
                >
                  Browse Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          UNIFIED HERO SCANNER COMPONENT
          Combines drop zone, camera capture, and scan results
          ═══════════════════════════════════════════════════════════ */}
      <div className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {/* ── CASE 1: Active Live Camera Viewfinder ── */}
        {isCameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-[16/10] max-h-[500px] flex items-center justify-center border border-white/10 shadow-2xl">
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                  el.srcObject = mediaStreamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Cyber Scanning HUD */}
            <div className="absolute inset-0 scanner-grid pointer-events-none opacity-40" />
            <div className="absolute inset-x-8 h-0.5 scanner-beam animate-scan pointer-events-none" />

            {/* Corner Brackets */}
            <div className="absolute inset-6 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
              </div>
            </div>

            {/* Top Viewfinder Controls */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/75 text-emerald-400 border border-emerald-500/30 backdrop-blur-md font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE SENSOR FEED</span>
              </div>
              <div className="flex items-center gap-2">
                {hasMultipleCameras && (
                  <button
                    onClick={toggleFacingMode}
                    className="p-2 rounded-xl bg-black/75 hover:bg-slate-800 text-white backdrop-blur-md border border-white/10 transition-all"
                    title="Flip camera"
                  >
                    <SwitchCamera className="w-4 h-4 text-emerald-300" />
                  </button>
                )}
                <button
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-rose-900/80 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Bottom Shutter Action */}
            <div className="absolute bottom-5 inset-x-0 flex flex-col items-center justify-center gap-2">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-1 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Capture photo"
              >
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500" />
                </div>
              </button>
              <span className="text-[11px] font-semibold text-white/90 bg-black/75 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                Tap shutter to capture &amp; classify
              </span>
            </div>
          </div>
        ) : isInitializingCamera ? (
          /* Camera Initializing State */
          <div className="aspect-[16/10] max-h-[420px] rounded-2xl bg-black/70 flex flex-col items-center justify-center p-8 space-y-3 text-center">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <div className="text-white font-bold text-sm">Initializing Camera Sensor...</div>
            <p className="text-xs text-slate-400 max-w-xs">
              Connecting to video hardware on <code className="text-emerald-400">localhost:5173</code>
            </p>
          </div>
        ) : result ? (
          /* ── CASE 2: Scan Result View (Embedded inside the Unified Hero) ── */
          <div className="space-y-6 animate-slide-in">
            {/* Header: Item Identity & Stream Classification */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                      result.recyclable
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {result.recyclable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Recyclable Stream</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Non-Recyclable / Special</span>
                      </>
                    )}
                  </span>
                  {result.isDemo && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      Preset Demo
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {result.itemName}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Material Stream:{' '}
                  <strong className="text-emerald-400 font-semibold">{result.category}</strong>
                </p>
              </div>

              {/* Confidence Meter */}
              <div className="sm:text-right">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  AI Confidence
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {Math.round(result.confidence * 100)}%
                </div>
                <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.confidence > 0.85
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 to-orange-400'
                    }`}
                    style={{ width: `${Math.round(result.confidence * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Critical Edge Case 1: Contamination Residue Warning */}
            {hasResidueWarning && (
              <div
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isRinsed
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isRinsed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-900'
                      }`}
                    >
                      {isRinsed ? <Check className="w-5 h-5" /> : <Droplets className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {isRinsed ? 'Container Rinsed & Clean' : 'Warning: Residue detected.'}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isRinsed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isRinsed ? '+10 Bonus Pts Claimed ✓' : 'Residue Alert'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {isRinsed
                          ? 'Container is decontaminated. Clean recyclables prevent entire batches from being rejected at municipal recovery centers!'
                          : 'Warning: Residue detected. Rinse for +10 bonus pts.'}
                      </p>
                    </div>
                  </div>

                  {!isRinsed ? (
                    <button
                      onClick={handleRinseContainer}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <Droplets className="w-4 h-4 text-blue-200" />
                      <span>Rinse for +10 pts</span>
                    </button>
                  ) : (
                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                      <Check className="w-4 h-4" />
                      <span>Verified Clean</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Critical Edge Case 2: Multi-Material Packaging (e.g. Tetra Pak) */}
            {isMultiMaterial && (
              <div
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  capSeparated
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-indigo-500/10 border-indigo-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        capSeparated ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {capSeparated ? <Check className="w-5 h-5" /> : <Scissors className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {capSeparated ? 'Cap Separated from Carton' : 'Multi-Material Packaging (Tetra Pak)'}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            capSeparated
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {capSeparated ? '+5 Pts Claimed ✓' : 'Composite Packaging'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {capSeparated
                          ? 'Plastic screw spout detached from carton. Both materials can now be processed in their respective clean streams.'
                          : 'Composite packaging with plastic cap. Separate cap from carton to optimize fiber recovery.'}
                      </p>
                    </div>
                  </div>

                  {!capSeparated ? (
                    <button
                      onClick={handleSeparateCap}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <Scissors className="w-4 h-4 text-indigo-200" />
                      <span>Separate Cap (+5 pts)</span>
                    </button>
                  ) : (
                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                      <Check className="w-4 h-4" />
                      <span>Separated</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hazard Alert if applicable */}
            {result.hazardLevel && result.hazardLevel !== 'none' && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3.5 text-rose-200">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <h5 className="font-bold text-sm text-white">
                    Special Handling Required ({result.hazardLevel.toUpperCase()} HAZARD)
                  </h5>
                  <p className="mt-0.5 text-rose-300/90">
                    Do not discard with household waste. Contains chemical or battery fire hazards. Deposit only at authorized e-waste depots.
                  </p>
                </div>
              </div>
            )}

            {/* Preparation Steps Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Preparation Instructions</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Disposal Destination */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Correct Disposal Destination</span>
                </div>
                <p className="text-sm font-bold text-white mt-1">{result.disposalMethod}</p>
              </div>
              {result.specialHandling && (
                <button
                  onClick={() => navigate('/centers')}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
                >
                  Locate Hub
                </button>
              )}
            </div>

            {/* Environmental Tip */}
            {result.environmentalTip && (
              <div className="text-xs text-emerald-300 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{result.environmentalTip}</span>
              </div>
            )}

            {/* Action Row */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                disabled={hasActionRecorded}
                onClick={confirmDisposal}
                className={`flex-1 py-3.5 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
                  hasActionRecorded
                    ? 'bg-emerald-700/80 cursor-default shadow-sm border border-emerald-500/30'
                    : `${currentColor.bgClass} hover:opacity-95 ${currentColor.glowClass} hover:scale-[1.01] active:scale-95`
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {hasActionRecorded ? t('scanner.disposalRecorded') : t('scanner.confirmSorted')}
                </span>
              </button>

              <button
                onClick={clearSelection}
                className="py-3.5 px-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Scan Another Item</span>
              </button>
            </div>

            {/* Manual Category Override dropdown */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400">Incorrect material stream?</span>
              <div className="relative">
                <button
                  onClick={() => setShowOverride(!showOverride)}
                  className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Manual Override</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showOverride && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-20 p-2 space-y-1 backdrop-blur-xl">
                    {[
                      'Plastic',
                      'Paper and cardboard',
                      'Glass',
                      'Metal',
                      'Organic / compostable',
                      'Electronic waste',
                      'Batteries',
                      'General or non-recyclable waste',
                      'Potentially hazardous waste'
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryOverride(cat as WasteCategory)}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-300 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : previewUrl ? (
          /* ── CASE 3: Image Preview Selected (Ready to Scan) ── */
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-[16/9] max-h-[440px] bg-slate-950 border border-white/10 flex items-center justify-center">
              <img src={previewUrl} alt="To classify" className="w-full h-full object-contain" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className="p-2 rounded-xl bg-black/75 text-white hover:bg-rose-600 backdrop-blur-md transition-colors shadow-md"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scan Trigger Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled={isScanning}
                onClick={executeScan}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white ${currentColor.bgClass} ${currentColor.glowClass} transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Classifying Material with Vision AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Analyze Waste Item</span>
                  </>
                )}
              </button>

              <button
                onClick={clearSelection}
                className="py-3.5 px-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all text-center"
              >
                Change Photo
              </button>
            </div>
          </div>
        ) : (
          /* ── CASE 4: Unified Center Dropzone & Live Camera Trigger ── */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl py-12 px-6 sm:px-12 flex flex-col items-center justify-center text-center transition-all duration-200 ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.02]'
            }`}
          >
            {/* Ambient Animated Dropzone Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Drag &amp; Drop Image or Capture Live
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
              Drop packaging, containers, or electronics to identify recyclability, contamination alerts, and disposal routes.
            </p>

            {/* Central Action CTA Group */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={() => startCamera()}
                className={`flex-1 min-w-[160px] py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white ${currentColor.bgClass} ${currentColor.glowClass} hover:opacity-95 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2`}
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Open Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-w-[140px] py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-slate-400" />
                <span>Browse Files</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 mt-4 font-mono">
              Accepts JPEG, PNG, WebP up to 10MB
            </span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          INSTANT DEMO PRESETS (Streamlined, Unbreakable Rendering)
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Demo Presets</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any benchmark item for instant offline/online classification testing
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            9 verified items
          </span>
        </div>

        {/* Unbreakable Preset Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2.5">
          {DEMO_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onClick={() => loadPreset(preset)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
