import httpx
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY, is_supabase_configured
from app.auth import get_current_user
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse,
    AssessmentSummary,
    AssessmentListResponse,
)

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

def get_bearer_token(authorization: str = Header(...)) -> str:
    """Extract raw bearer token for Supabase PostgREST RLS."""
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authorization header format",
    )

def get_supabase_headers(token: str) -> Dict[str, str]:
    """Headers for authenticated Supabase PostgREST queries enforcing RLS."""
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation",
    }

@router.get("", response_model=AssessmentListResponse)
async def list_assessments(
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_bearer_token),
) -> AssessmentListResponse:
    """
    List all assessments owned by the authenticated user.
    Enforces user_id filtering and Supabase Row Level Security.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on the backend.",
        )

    user_id = current_user.get("id") or current_user.get("sub")
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/assessments?user_id=eq.{user_id}&order=updated_at.desc"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(endpoint, headers=get_supabase_headers(token))
        if response.status_code == 200:
            records = response.json()
            return AssessmentListResponse(items=records, total=len(records))
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch assessments: {response.text}",
            )

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_or_upsert_assessment(
    payload: AssessmentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_bearer_token),
) -> AssessmentResponse:
    """
    Create a new assessment or upsert by ID if provided (preventing duplicate records on retries).
    Forces user_id to match the verified token subject.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on the backend.",
        )

    user_id = current_user.get("id") or current_user.get("sub")
    record_data = payload.model_dump(exclude_unset=True)
    record_data["user_id"] = user_id

    # If payload includes an id, check if it already exists for this user (upsert / update)
    if payload.id:
        endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/assessments?on_conflict=id"
        headers = get_supabase_headers(token)
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(endpoint, json=[record_data], headers=headers)
            if response.status_code in (200, 201):
                res_json = response.json()
                if res_json:
                    return res_json[0]
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to upsert assessment: {response.text}",
            )
    else:
        # Standard insert
        endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/assessments"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(endpoint, json=[record_data], headers=get_supabase_headers(token))
            if response.status_code in (200, 201):
                res_json = response.json()
                if res_json:
                    return res_json[0]
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to create assessment: {response.text}",
            )

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_bearer_token),
) -> AssessmentResponse:
    """
    Retrieve a specific assessment by ID.
    Enforces ownership check: returns 404 if the record does not belong to the user.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on the backend.",
        )

    user_id = current_user.get("id") or current_user.get("sub")
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/assessments?id=eq.{assessment_id}&user_id=eq.{user_id}&limit=1"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(endpoint, headers=get_supabase_headers(token))
        if response.status_code == 200:
            records = response.json()
            if not records:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assessment record not found or access denied.",
                )
            return records[0]
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error retrieving assessment: {response.text}",
            )

@router.put("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: str,
    payload: AssessmentUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_bearer_token),
) -> AssessmentResponse:
    """
    Update an existing assessment by ID.
    Validates ownership before updating; returns 404 if unauthorized or nonexistent.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on the backend.",
        )

    user_id = current_user.get("id") or current_user.get("sub")
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/assessments?id=eq.{assessment_id}&user_id=eq.{user_id}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.patch(endpoint, json=update_data, headers=get_supabase_headers(token))
        if response.status_code == 200:
            records = response.json()
            if not records:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assessment record not found or access denied.",
                )
            return records[0]
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to update assessment: {response.text}",
            )

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_bearer_token),
):
    """
    Delete an assessment by ID.
    Enforces ownership: only deletes if user_id matches.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on the backend.",
        )

    user_id = current_user.get("id") or current_user.get("sub")
    endpoint = f"{SUPABASE_URL.rstrip('/')}/rest/v1/assessments?id=eq.{assessment_id}&user_id=eq.{user_id}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.delete(endpoint, headers=get_supabase_headers(token))
        if response.status_code in (200, 204):
            return None
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to delete assessment: {response.text}",
            )
