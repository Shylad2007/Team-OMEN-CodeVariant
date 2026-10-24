import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory if present
env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://localhost:4173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:4173"
)
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL_ID = os.getenv("GEMINI_MODEL_ID", "gemini-3.6-flash").strip()

def is_supabase_configured() -> bool:
    """Check if valid Supabase configuration is present."""
    return (
        bool(SUPABASE_URL) 
        and bool(SUPABASE_ANON_KEY) 
        and not SUPABASE_URL.startswith("https://your-project-id")
    )

def is_gemini_configured() -> bool:
    """Check if valid Gemini API key is configured."""
    return bool(GEMINI_API_KEY) and not GEMINI_API_KEY.startswith("your-")
