// Deep link scheme for the app
const APP_SCHEME = 'shoppingtogether';
const WEB_HOST = 'shoppingtogether.app'; // Placeholder for future web hosting

/**
 * Create a shareable deep link URL for a list
 * Uses the app scheme for native deep linking
 */
export function createShareUrl(linkToken: string): string {
  return `${APP_SCHEME}://join/${linkToken}`;
}

/**
 * Create a web URL for sharing (fallback for non-app users)
 * This would redirect to app stores or web app
 */
export function createWebShareUrl(linkToken: string): string {
  return `https://${WEB_HOST}/join/${linkToken}`;
}

/**
 * Parse a deep link URL to extract the link token
 * Supports both app scheme and web URLs
 * @returns The link token or null if not a valid join URL
 */
export function parseShareUrl(url: string): string | null {
  try {
    // Handle app scheme: shoppingtogether://join/{token}
    if (url.startsWith(`${APP_SCHEME}://`)) {
      const path = url.replace(`${APP_SCHEME}://`, '');
      const match = path.match(/^join\/([a-zA-Z0-9]+)$/);
      return match ? match[1] : null;
    }

    // Handle web URL: https://shoppingtogether.app/join/{token}
    const webUrlMatch = url.match(
      new RegExp(`^https?://${WEB_HOST}/join/([a-zA-Z0-9]+)$`),
    );
    if (webUrlMatch) {
      return webUrlMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is a valid share link
 */
export function isShareUrl(url: string): boolean {
  return parseShareUrl(url) !== null;
}
