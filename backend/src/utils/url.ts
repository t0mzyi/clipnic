/**
 * Returns the base URL for the API.
 * Priority: API_URL > Custom Domain > Render URL > localhost
 */
export function getBaseUrl() {
    if (process.env.API_URL) {
        return process.env.API_URL.replace(/\/$/, '');
    }
    
    // Explicitly prefer the custom domain in production
    if (process.env.NODE_ENV === 'production') {
        return 'https://api.clipnic.com';
    }

    if (process.env.RENDER_EXTERNAL_URL) {
        return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
    }

    return 'http://localhost:5000';
}
