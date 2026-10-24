import httpx
import jwt
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET, is_supabase_configured

async def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verify a Supabase access token.
    1. If SUPABASE_JWT_SECRET is configured, attempts local JWT verification.
    2. Otherwise, calls Supabase's /auth/v1/user endpoint with the token.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on the backend. Please populate SUPABASE_URL and SUPABASE_ANON_KEY."
        )

    # Method 1: Local JWT verification if valid secret is provided
    if SUPABASE_JWT_SECRET and not SUPABASE_JWT_SECRET.startswith("your-"):
        try:
            payload = jwt.decode(
                token, 
                SUPABASE_JWT_SECRET, 
                algorithms=["HS256"], 
                audience="authenticated"
            )
            return payload
        except jwt.PyJWTError:
            # Fall back to remote verification with Supabase Auth server
            pass

    # Method 2: Remote verification with Supabase Auth server
    user_endpoint = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(user_endpoint, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token from Supabase Auth",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to communicate with Supabase Auth: {str(e)}"
        )

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """FastAPI dependency to extract and verify the current authenticated user."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Must be 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    return await verify_supabase_token(token)
