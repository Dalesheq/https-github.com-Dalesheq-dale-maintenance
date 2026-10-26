import React, { useState } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { PhotoAttachment, ChecklistSection } from '../types';

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
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    caption: 'Wearstrip and modular plastic links alignment check',
  },
  {
    name: 'Damaged Chain Links & Pins',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    caption: 'Few broken chain links and loose retaining clips detected',
  },
  {
    name: 'Surefire Belt Oiler System',
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
    caption: 'Automatic lubricator reservoir and Festo pneumatic lines',
  },
  {
    name: 'Main Electrical Control Panel & VFDs',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    caption: 'Main PLC enclosure terminal connections and safety relays',
  },
  {
    name: 'Flame Tubes Refractory Failure',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    caption: 'Severe refractory erosion and crack on 2.4m bake chamber flame tube',
  },
  {
    name: 'Heavy Industrial Drive Gearbox & Motor',
    url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&auto=format&fit=crop&q=80',
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

  if (!isOpen) return null;

  // Flatten all items across sections for easy dropdown selection
  const allItems = sections.flatMap((sec) =>
    sec.items.map((item) => ({
      sn: item.sn,
      name: item.name,
      sectionTitle: sec.title,
    }))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image to max 1200px width/height for fast offline storage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoUrl(compressedUrl);
        } else {
          setPhotoUrl(event.target?.result as string);
        }
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-slate-800" />
            <h3 className="text-base font-bold text-slate-900">Attach Site Inspection Photo</h3>
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
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                <Upload className="h-4 w-4 text-slate-500" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Camera className="h-4 w-4 text-slate-500" />
                <span>Use Camera</span>
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

          {/* Preset Photos for Fast Field Simulation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Or pick sample Dale Automation equipment photo:
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {PRESET_INDUSTRIAL_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPhotoUrl(preset.url);
                    setCaption(preset.caption);
                  }}
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

          {/* Photo Preview */}
          {photoUrl && (
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
              <img
                src={photoUrl}
                alt="Inspection preview"
                className="max-h-56 w-full object-contain"
                referrerPolicy="no-referrer"
              />
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
    </div>
  );
};
