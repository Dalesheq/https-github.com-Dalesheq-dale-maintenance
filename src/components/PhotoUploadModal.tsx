import React, { useState } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon, CheckCircle2, ZoomIn, Eye, Sparkles } from 'lucide-react';
import { PhotoAttachment, ChecklistSection } from '../types';
import { compressIndustrialImage, formatBytes, CompressionResult } from '../utils/imageCompressor';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ChecklistSection[];
  initialSnItem?: number;
  onAddPhoto: (photo: PhotoAttachment) => void;
  currentGps?: { latitude: number; longitude: number };
}

// Preset authentic industrial field photo library for quick field testing
const PRESET_INDUSTRIAL_PHOTOS = [
  {
    name: 'Modular Spiral Conveyor Belt & Rail',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1600&auto=format&fit=crop&q=85',
    caption: 'Wearstrip and modular plastic links alignment check',
  },
  {
    name: 'Damaged Chain Links & Pins',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=85',
    caption: 'Few broken chain links and loose retaining clips detected',
  },
  {
    name: 'Surefire Belt Oiler System',
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1600&auto=format&fit=crop&q=85',
    caption: 'Automatic lubricator reservoir and Festo pneumatic lines',
  },
  {
    name: 'Main Electrical Control Panel & VFDs',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&auto=format&fit=crop&q=85',
    caption: 'Main PLC enclosure terminal connections and safety relays',
  },
  {
    name: 'Flame Tubes Refractory Failure',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1600&auto=format&fit=crop&q=85',
    caption: 'Severe refractory erosion and crack on 2.4m bake chamber flame tube',
  },
  {
    name: 'Heavy Industrial Drive Gearbox & Motor',
    url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1600&auto=format&fit=crop&q=85',
    caption: 'SEW-Eurodrive reduction unit and shaft coupling alignment',
  },
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  sections,
  initialSnItem,
  onAddPhoto,
  currentGps,
}) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedSn, setSelectedSn] = useState<number | undefined>(initialSnItem);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  if (!isOpen) return null;

  // Flatten all items across sections for easy dropdown selection
  const allItems = sections.flatMap((sec) =>
    sec.items.map((item) => ({
      sn: item.sn,
      name: item.name,
      sectionTitle: sec.title,
    }))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCompressionStats(null);

    try {
      // High-detail industrial compression: keeps max 2048px for fine serial plates/cracks
      const result = await compressIndustrialImage(file, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.88,
      });

      setPhotoUrl(result.dataUrl);
      setCompressionStats(result);
    } catch (err) {
      console.error('High-detail compression error:', err);
      // Fallback to FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_INDUSTRIAL_PHOTOS[0]) => {
    setPhotoUrl(preset.url);
    setCaption(preset.caption);
    setCompressionStats(null);
  };

  const handleSave = () => {
    if (!photoUrl) return;

    const matchedItem = allItems.find((i) => i.sn === selectedSn);

    const newPhoto: PhotoAttachment = {
      id: `photo-${Date.now()}`,
      url: photoUrl,
      caption: caption.trim() || (matchedItem ? `${matchedItem.name} site verification` : 'Equipment photo'),
      snItem: selectedSn,
      itemName: matchedItem?.name,
      timestamp: new Date().toISOString(),
      gps: currentGps,
    };

    onAddPhoto(newPhoto);
    onClose();
    setPhotoUrl('');
    setCaption('');
    setCompressionStats(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-slate-800" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Attach Site Inspection Photo</h3>
              <p className="text-[11px] text-slate-500">High-detail compression preserves machine plates and fine cracks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* File Upload / Camera Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Capture or Upload Image</label>
            <div className="mt-1.5 flex items-center gap-3">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                <Upload className="h-4 w-4 text-slate-500" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <Camera className="h-4 w-4 text-slate-500" />
                <span>Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 animate-pulse">
              <Sparkles className="h-4 w-4 text-blue-600 animate-spin" />
              <span>Optimizing high-detail image (preserving serial plates and structural lines)...</span>
            </div>
          )}

          {/* Compression Stats Indicator */}
          {compressionStats && !isProcessing && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Detail-Preserved Compression Complete
                </span>
                <span className="font-mono-numbers text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {compressionStats.compressionRatio}% saved
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-700 pt-0.5">
                <span>
                  Original: <strong>{formatBytes(compressionStats.originalSizeBytes)}</strong> ({compressionStats.originalWidth}×{compressionStats.originalHeight}px)
                </span>
                <span>→</span>
                <span>
                  Compressed: <strong>{formatBytes(compressionStats.compressedSizeBytes)}</strong> ({compressionStats.width}×{compressionStats.height}px)
                </span>
              </div>
            </div>
          )}

          {/* Preset Photos for Fast Field Simulation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Or pick Dale Automation sample equipment photo:
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {PRESET_INDUSTRIAL_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`group relative overflow-hidden rounded-lg border text-left transition-all ${
                    photoUrl === preset.url ? 'border-blue-600 ring-2 ring-blue-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="h-16 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-1 bg-white">
                    <p className="truncate text-[10px] font-medium text-slate-700">{preset.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Preview with Lightbox Zoom Action */}
          {photoUrl && (
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 group">
              <img
                src={photoUrl}
                alt="Inspection preview"
                className="max-h-60 w-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="absolute top-2 right-2 rounded-lg bg-black/70 px-2.5 py-1 text-xs text-white backdrop-blur-xs flex items-center gap-1 hover:bg-black/90 transition-colors shadow-sm"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Inspect Full Detail</span>
              </button>
              {currentGps && (
                <div className="absolute bottom-2 left-2 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] text-white backdrop-blur-xs font-mono-numbers">
                  GPS: {currentGps.latitude.toFixed(4)}, {currentGps.longitude.toFixed(4)}
                </div>
              )}
            </div>
          )}

          {/* Associate with Item # */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Tag to Inspection Item (Optional)
            </label>
            <select
              value={selectedSn ?? ''}
              onChange={(e) => setSelectedSn(e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-900 focus:outline-hidden"
            >
              <option value="">General Site / Machinery Overview</option>
              {allItems.map((item) => (
                <option key={item.sn} value={item.sn}>
                  SN {item.sn}. {item.name} ({item.sectionTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Description / Technical Observation</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Broken link on tier 3 entry curve; requires urgent pin replacement"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!photoUrl || isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Attach Photo to Report
          </button>
        </div>
      </div>

      {/* Full Detail Lightbox Inspection Modal */}
      {showLightbox && photoUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-auto flex flex-col items-center">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-800 z-10"
              aria-label="Close Preview"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={photoUrl}
              alt="High detail equipment verification"
              className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 text-center text-xs text-slate-300">
              High Resolution Industrial Detail Verification View
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
