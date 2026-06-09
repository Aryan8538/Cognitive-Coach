// Shared frontend configurations
// Falls back to localhost for local testing, can be overridden by NEXT_PUBLIC_API_URL on Vercel
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
