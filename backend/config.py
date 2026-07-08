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
# Model used for transcription, evaluation and chat. Overridable via env so it
# can be bumped without a code change when Google rotates model availability.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

# --- Auth ---
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey-for-cognitive-coach-2026")
# Supabase project JWT secret; when unset, Supabase sessions are treated as
# anonymous sandbox users instead of being trusted.
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET") or os.getenv("JWT_SECRET")

# --- Database ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coach.db")

# --- CORS ---
# Comma-separated list of additional allowed origins (exact matches).
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")

# Regex matching allowed origins by pattern. Defaults to any Vercel domain over
# HTTPS, which covers both the production *.vercel.app domain and every
# auto-generated preview deployment (e.g. my-app-git-branch-user.vercel.app)
# without having to enumerate the ever-changing preview subdomains. Override via
# env if the frontend also serves from a custom domain.
ALLOWED_ORIGIN_REGEX = os.getenv(
    "ALLOWED_ORIGIN_REGEX", r"https://.*\.vercel\.app"
)
