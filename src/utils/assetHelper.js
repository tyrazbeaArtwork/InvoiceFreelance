
/**
 * Helper function to correctly construct asset paths for both local development and GitHub Pages.
 * 
 * @param {string} path - The path to the asset, relative to the public directory (e.g., "assets/image.png")
 * @returns {string} The full URL to the asset
 */
export const getAssetPath = (path) => {
    // Get the base URL from Vite environment
    const base = import.meta.env.BASE_URL;

    // Clean up the path: remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Clean up the base: ensure it ends with slash
    const cleanBase = base.endsWith('/') ? base : `${base}/`;

    // Combine them
    return `${cleanBase}${cleanPath}`;
};
