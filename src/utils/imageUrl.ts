/**
 * Resolve relative image URLs to the backend origin.
 * Image URLs from backend are stored as "/images/products/xxx.jpg"
 * which needs the backend origin prepended (without /api suffix).
 */
export const resolveImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // VITE_API_URL is "http://localhost:5255/api" — strip "/api" to get origin
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const origin = apiUrl.replace(/\/api\/?$/, '');

    return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
};
