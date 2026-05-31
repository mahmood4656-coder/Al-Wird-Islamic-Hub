/**
 * Resolves a potentially CORS-restricted or regionally blocked audio URL 
 * to a CORS-friendly streamable and downloadable URL.
 * 
 * Uses the stable, public, and free corsproxy.io service.
 */
export const getCorsFriendlyUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('archive.org')) {
    const cleanSafeFilename = url.substring(url.lastIndexOf('/') + 1) || 'audio.mp3';
    return `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanSafeFilename)}`;
  }
  return url;
};
