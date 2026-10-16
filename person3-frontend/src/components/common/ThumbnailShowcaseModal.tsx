import React, { useState } from 'react';
import {
  Image,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  X,
  Check,
  Radio,
  Layers,
  Copy
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const ThumbnailShowcaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { currentColor } = useSettings();
  const { showToast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/thumbnail.svg`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Thumbnail URL Copied', 'Ready to paste into documentation or social posts!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = '/thumbnail.svg';
    a.download = 'smart-recycle-ai-thumbnail.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download Started', 'smart-recycle-ai-thumbnail.svg saved.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl glass-card rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 inset-x-0 h-[2px]"
          style={{ background: `linear-gradient(to right, transparent, ${currentColor.hex}, transparent)` }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: currentColor.hex }}
            >
              <Image className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Official Frontend Thumbnail</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-emerald-400">
                  1200 × 630 HD SVG
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Ultra-high-resolution Open Graph &amp; portfolio showcase banner with Live GPS radar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Preview Area */}
        <div className="my-4 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-2 flex items-center justify-center">
          <img
            src="/thumbnail.svg"
            alt="Smart Recycle AI Frontend Thumbnail"
            className="w-full h-auto max-h-[55vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Modal Footer & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Format: SVG Vector • Compatible with GitHub, Devpost, LinkedIn, Discord &amp; Twitter Cards</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: currentColor.hex }}
            >
              <Download className="w-4 h-4" />
              <span>Download Vector SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
