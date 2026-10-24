from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.config import PORT, CORS_ORIGINS, is_supabase_configured, is_gemini_configured
from app.auth import get_current_user
from app.routers import assessments, decision_intelligence

app = FastAPI(
    title="R3VIVE API",
    description="Backend API for R3VIVE — Circular decision intelligence platform.",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(assessments.router)
app.include_router(decision_intelligence.router)

@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "r3vive-backend",
        "supabase_configured": is_supabase_configured(),
        "gemini_configured": is_gemini_configured(),
    }

@app.get("/api/auth/status")
async def auth_status() -> Dict[str, Any]:
    """Report backend authentication configuration status."""
    return {
        "configured": is_supabase_configured(),
        "message": (
            "Supabase Auth is configured on backend."
            if is_supabase_configured()
            else "Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are missing or set to placeholder values."
        ),
    }

@app.get("/api/auth/me")
async def get_authenticated_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Protected user profile endpoint.
    Verifies the user's Supabase access token and returns sanitized profile information.
    """
    user_id = current_user.get("id") or current_user.get("sub")
    email = current_user.get("email")
    user_metadata = current_user.get("user_metadata", {})
    full_name = user_metadata.get("full_name") or user_metadata.get("name", "")

    return {
        "id": user_id,
        "email": email,
        "full_name": full_name,
        "authenticated": True,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)
