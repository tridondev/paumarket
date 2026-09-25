/**
 * Compresses an image in the browser before it's uploaded to Firebase
 * Storage: downscales anything larger than `maxDimension` on its longest
 * side and re-encodes as WebP at `quality`. This is what keeps listing
 * photos (often multi-megabyte phone camera shots) from bloating storage
 * costs and slowing down every product grid that has to load them.
 *
 * Falls back to the original file untouched if compression isn't available
 * (very old browsers) or if it would somehow make the file bigger.
 */
export async function compressImage(
  file: File,
  opts: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const { maxDimension = 1600, quality = 0.82 } = opts;

  if (typeof window === 'undefined' || !file.type.startsWith('image/')) return file;
  // Animated GIFs lose their animation if we redraw them onto a canvas —
  // leave those alone.
  if (file.type === 'image/gif') return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    // createImageBitmap/canvas can throw on corrupt files or in unsupported
    // environments — upload the original rather than block the listing.
    return file;
  }
}

export async function compressImages(
  files: File[],
  opts?: { maxDimension?: number; quality?: number }
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, opts)));
}

/** Human-readable file size, for showing users how much was saved. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
