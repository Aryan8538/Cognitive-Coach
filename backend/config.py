"""Centralized application configuration.

Loads environment variables once (via python-dotenv) and exposes them as
module-level constants so individual modules no longer each call load_dotenv()
and os.getenv(). Values and defaults are identical to the previous inline
lookups, so behavior is unchanged.
"""
import os
from dotenv import load_dotenv

# Load .env a single time for the whole process.
load_dotenv()

# --- AI (optional; absence enables offline "sandbox" mode) ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Auth ---
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey-for-cognitive-coach-2026")
# Supabase project JWT secret; when unset, Supabase sessions are treated as
# anonymous sandbox users instead of being trusted.
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# --- Database ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coach.db")

# --- CORS ---
# Comma-separated list of additional allowed origins.
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
