// Shared frontend configurations
// Falls back to localhost for local testing, can be overridden by NEXT_PUBLIC_API_URL on Vercel
const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    // Dynamically resolve backend port 8000 on the same host (handles localhost/IP configurations)
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();
