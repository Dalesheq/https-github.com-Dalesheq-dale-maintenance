/**
 * Dale Automation High-Detail Industrial Photo Compressor
 * Specially designed for heavy machinery inspections: preserving machine serial plates,
 * electrical wiring tags, crack propagation lines, and component stamps while reducing
 * payload size by 85-95% for instant offline storage and sync.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  compressionRatio: number; // percentage saved
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Format bytes to readable string (e.g. 4.2 MB, 350 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * High-detail industrial image compression using multi-step resampling
 * to prevent pixel aliasing and preserve razor-sharp text on equipment plates.
 */
export async function compressIndustrialImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.88,
  } = options;

  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));

      img.onload = () => {
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;

        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        // Calculate aspect-ratio preserved target dimensions
        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        // Multi-step downsampling for extreme downsizes (>2x reduction)
        // Single-pass canvas resize can introduce severe blur on fine lines.
        let sourceCanvas: HTMLCanvasElement | HTMLImageElement = img;
        let currentWidth = originalWidth;
        let currentHeight = originalHeight;

        while (currentWidth * 0.5 > targetWidth && currentHeight * 0.5 > targetHeight) {
          const halfCanvas = document.createElement('canvas');
          currentWidth = Math.round(currentWidth * 0.5);
          currentHeight = Math.round(currentHeight * 0.5);
          halfCanvas.width = currentWidth;
          halfCanvas.height = currentHeight;

          const halfCtx = halfCanvas.getContext('2d');
          if (halfCtx) {
            halfCtx.imageSmoothingEnabled = true;
            halfCtx.imageSmoothingQuality = 'high';
            halfCtx.drawImage(sourceCanvas, 0, 0, currentWidth, currentHeight);
            sourceCanvas = halfCanvas;
          } else {
            break;
          }
        }

        // Final crisp render at target resolution
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetWidth;
        finalCanvas.height = targetHeight;
        const ctx = finalCanvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get 2D canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image with crisp high-detail interpolation
        ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

        // Convert to high-detail JPEG (0.88 quality preserves sub-pixel text and metal textures)
        const compressedDataUrl = finalCanvas.toDataURL('image/jpeg', quality);

        // Estimate compressed byte size from base64
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
        const compressedSizeBytes = Math.round((base64Length * 3) / 4);

        const savedBytes = Math.max(0, originalSizeBytes - compressedSizeBytes);
        const compressionRatio = originalSizeBytes > 0
          ? Math.round((savedBytes / originalSizeBytes) * 100)
          : 0;

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeBytes,
          compressedSizeBytes,
          originalWidth,
          originalHeight,
          width: targetWidth,
          height: targetHeight,
          compressionRatio,
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
