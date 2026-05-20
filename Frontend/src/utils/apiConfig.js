// Centralized API configuration to dynamically resolve the Backend URL 
// in both local development (Vite + Django) and cloud production (Render / Railway).

const getApiBaseUrl = () => {
  const { protocol, hostname } = window.location;

  // Optional: use same-origin Vercel rewrites only when explicitly enabled.
  // The deployed project currently does not apply vercel.json rewrites, so the
  // default production path should call the Render backend directly.
  if (import.meta.env.VITE_USE_VERCEL_PROXY === 'true' && hostname.endsWith('.vercel.app')) {
    return '';
  }

  // 1. Allow explicit override via Vite environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, ''); // strip trailing slash if present
  }
  
  // 2. Otherwise, dynamically derive it based on the browser's hostname
  // If running locally, point to Django's dev server port 8000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:8000`;
  }
  
  // If deployed on Render/Railway, fallback to current origin
  return 'https://synycs.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_API_URL = `${API_BASE_URL}/api`;

export default API_BASE_URL;
// force rebuild
