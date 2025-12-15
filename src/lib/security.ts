/**
 * Sanitizes a URL to prevent XSS attacks (e.g., javascript: protocol).
 * Allows http, https, mailto, tel, and relative paths.
 * Returns '#' if the URL is considered unsafe.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Allow relative paths (start with / or # or ?)
  if (/^[\/#?]/.test(trimmed)) return trimmed;

  // Allow specific protocols
  if (/^(https?|mailto|tel):/i.test(trimmed)) return trimmed;

  return '#';
}
