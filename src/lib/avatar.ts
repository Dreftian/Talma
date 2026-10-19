export const DEFAULT_AVATAR = '/avatar-plane.png';

/**
 * Ensures an avatar URL resolves to a crisp, centered aviation badge
 * instead of the stretched or cropped legacy logo.
 */
export function getSafeAvatarUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('logo-talma.png')) {
    return DEFAULT_AVATAR;
  }
  return url;
}
