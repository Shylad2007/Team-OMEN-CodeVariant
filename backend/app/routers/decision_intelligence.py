import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, ValidationError
from app.config import GEMINI_API_KEY, GEMINI_MODEL_ID, is_gemini_configured

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/assessments", tags=["Decision Intelligence"])

# In-memory LRU-like cache to prevent duplicate Gemini calls and conserve API quota
_guidance_cache: Dict[str, "DecisionGuidanceResponse"] = {}
_MAX_CACHE_SIZE = 128

class DecisionGuidanceRequest(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1, max_length=50)
    brand_model: Optional[str] = None
    condition: str = Field(..., min_length=1, max_length=50)
    reported_fault: str = Field(..., min_length=1, max_length=2000)
    age: Optional[str] = None
    repair_cost: Optional[float] = None
    repair_cost_unknown: bool = False
    replacement_cost: Optional[float] = None
    replacement_cost_unknown: bool = False
    budget_constraint: Optional[str] = None
    urgency: Optional[str] = None
    primary_priority: Optional[str] = None
    recommended_outcome: str = Field(..., min_length=1, max_length=50)
    selected_outcome: str = Field(..., min_length=1, max_length=50)
    selected_branch_title: Optional[str] = None

class DecisionGuidanceResponse(BaseModel):
    ai_available: bool
    source: str
    summary_verdict: str
    practical_steps: List[str]
    safety_cautions: List[str]
    cost_carbon_insight: str
    model_version: Optional[str] = None
    note: Optional[str] = None

class StructuredAiGuidance(BaseModel):
    summary_verdict: str = Field(..., min_length=5)
    practical_steps: List[str] = Field(default_factory=list)
    safety_cautions: List[str] = Field(default_factory=list)
    cost_carbon_insight: str = Field(..., min_length=5)

def detect_hazard(req: DecisionGuidanceRequest) -> bool:
    """
    Detect safety-critical hazards that require mandatory deterministic precautions.
    Accurately detects: swollen/leaking batteries, thermal runaway, active smoke/fire,
    dangerous electrical arcing, and toxic chemical/gas leaks.
    Excludes false positives: cooktop/stove burners, spark plugs, sparkling aesthetics,
    and regular battery maintenance.
    """
    text = f"{req.reported_fault} {req.item_name} {req.condition}".lower()

    # 1. Swollen / compromised battery cells
    has_battery = "battery" in text or "batteries" in text or "cell" in text
    has_swelling = any(w in text for w in ["swollen", "bulging", "bloated", "puffed", "expanded"])
    if (has_battery and has_swelling) or any(k in text for k in ["thermal runaway", "battery acid", "battery leak"]):
        return True

    # 2. Fire, explosion, active combustion
    if any(k in text for k in ["catching fire", "caught fire", "exploded", "explosion", "burst into flames", "electrical fire"]):
        return True
    if " fire " in f" {text} " and not any(k in text for k in ["firewall", "fire extinguisher", "fire pit", "firepit"]):
        return True

    # 3. Active smoke or burning smell (exclude gas/stove burners, cd/dvd burners, incense burners)
    is_burner = any(k in text for k in ["burner", "burners"])
    if any(k in text for k in ["smoke", "smoking", "fuming", "burning smell", "burnt smell"]):
        return True
    if any(k in text for k in ["burnt", "burning", "charred"]) and not is_burner:
        if any(k in text for k in ["wire", "wiring", "pcb", "motor", "cable", "transformer"]):
            return True

    # 4. Dangerous electrical arcing / shock (exclude spark plug or sparkling)
    is_spark_plug = "spark plug" in text or "sparkplug" in text
    is_sparkle = "sparkle" in text or "sparkling" in text
    has_spark = any(w in text for w in ["sparking", "sparks", "electrical arc", "arcing"]) and not is_spark_plug and not is_sparkle
    if has_spark or any(k in text for k in ["electric shock", "exposed live wire"]):
        return True

    # 5. Toxic chemical, refrigerant, or gas leaks
    if any(k in text for k in [
        "chemical leak", "acid leak", "mercury leak", "refrigerant leak", "freon leak", "gas leak", "toxic fumes", "asbestos"
    ]):
        return True

    return False

def get_mandatory_safety_precautions(req: DecisionGuidanceRequest) -> List[str]:
    """Generates non-negotiable safety cautions based on deterministic hazard analysis."""
    cautions = [
        "Disconnect all electrical sources and allow capacitors/heating elements to discharge fully before inspection.",
        "Work in a well-ventilated, well-lit area with eye protection and non-conductive precision tools.",
    ]
    if detect_hazard(req):
        cautions.insert(0, "CRITICAL HAZARD: Inspect for swelling, chemical leakage, or thermal discoloration. Never pierce, crush, or heat lithium-ion cells.")
        if req.selected_outcome.lower() == "repair":
            cautions.append("CRITICAL: DIY internal repair is strictly contraindicated for compromised battery/thermal faults. Route to authorized OEM repair or certified hazardous recycling.")
    return cautions

def generate_deterministic_guidance(req: DecisionGuidanceRequest) -> DecisionGuidanceResponse:
    """
    Grounded, transparent fallback guidance generated from deterministic category & condition rules.
    Used when Gemini is offline, unconfigured, rate-limited, or returns errors.
    """
    cat = req.category.lower()
    cond = req.condition.lower()
    outcome = req.selected_outcome.lower()

    # Deterministic safety
    safety = get_mandatory_safety_precautions(req)

    # Category-specific grounded steps
    steps = [
        f"Isolate the specific defect reported ('{req.reported_fault}') before opening non-essential sub-assemblies.",
        "Inspect connection terminals and fasteners for oxidation, cracks, or mechanical play.",
        "Document screw positions and cable routing carefully to facilitate clean reassembly.",
    ]

    if cat == "electronics":
        steps.append("Clean contaminated contact surfaces with 90%+ isopropyl alcohol and lint-free swabs.")
    elif cat == "appliances":
        steps.append("Inspect mechanical drive belts, water/air seals, and intake valves for physical degradation.")
    elif cat == "furniture":
        steps.append("Scrape brittle adhesive from failed joints and re-clamp securely with structural wood glue.")
    elif cat == "clothing":
        steps.append("Reinforce tension stress points with lock-stitching and match thread weight to fabric gauge.")
    elif cat == "tools":
        steps.append("Inspect motor carbon brushes for excessive wear (<5mm) and grease rotating gearboxes.")

    # Economic & circular insight
    cost_has_repair = req.repair_cost and not req.repair_cost_unknown and req.repair_cost > 0
    cost_has_replace = req.replacement_cost and not req.replacement_cost_unknown and req.replacement_cost > 0

    if cost_has_repair and cost_has_replace:
        diff = req.replacement_cost - req.repair_cost
        pct = round((diff / req.replacement_cost) * 100)
        if diff >= 0:
            cost_insight = f"Pursuing {outcome.upper()} saves approximately ₹{diff:,.0f} ({pct}%) compared to replacement while retaining embodied material value."
        else:
            cost_insight = f"Repair estimate exceeds standard replacement outlay by ₹{abs(diff):,.0f}; evaluate component harvesting or replacement."
    elif outcome == "reuse":
        cost_insight = "Reusing or donating preserves 100% of embodied product materials with zero capital expenditure."
    elif outcome == "recycle":
        cost_insight = "Certified recycling channels high-grade metals and clean polymers directly into secondary smelting."
    else:
        cost_insight = f"Choosing {outcome.upper()} avoids manufacturing carbon emissions and diverts durable components from landfill."

    summary = (
        f"Deterministic circular roadmap for {req.item_name} ({req.category}). "
        f"The {req.selected_outcome.upper()} pathway aligns with its {req.condition.replace('_', ' ')} condition "
        f"and focuses on component preservation over disposal."
    )

    return DecisionGuidanceResponse(
        ai_available=False,
        source="deterministic-rules-engine",
        summary_verdict=summary,
        practical_steps=steps,
        safety_cautions=safety,
        cost_carbon_insight=cost_insight,
        note="Generated by R3VIVE deterministic expert rules (Gemini API offline, quota-limited, or unconfigured).",
    )

def make_cache_key(req: DecisionGuidanceRequest) -> str:
    return f"{req.item_name}|{req.category}|{req.condition}|{req.reported_fault}|{req.repair_cost}|{req.repair_cost_unknown}|{req.replacement_cost}|{req.replacement_cost_unknown}|{req.selected_outcome}|{req.selected_branch_title}"

@router.post("/ai-guidance", response_model=DecisionGuidanceResponse)
async def get_decision_ai_guidance(payload: DecisionGuidanceRequest) -> DecisionGuidanceResponse:
    """
    Returns personalized contextual decision guidance.
    Uses Gemini (centrally configured GEMINI_MODEL_ID) with in-memory caching to conserve API quota.
    Provides seamless fallback to deterministic expert rules when AI is unconfigured or rate-limited.
    """
    # 1. Check in-memory cache to conserve API quota
    cache_key = make_cache_key(payload)
    if cache_key in _guidance_cache:
        logger.info(f"Returning cached decision guidance for {payload.item_name} ({payload.selected_outcome})")
        return _guidance_cache[cache_key]

    # 2. If Gemini key is not configured locally, return deterministic fallback immediately
    if not is_gemini_configured():
        fallback = generate_deterministic_guidance(payload)
        _guidance_cache[cache_key] = fallback
        return fallback

    # 3. Call Gemini with configured model identifier and sensible timeout
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        prompt = f"""
You are R3VIVE's Circular Decision Intelligence Assistant.
An item has been assessed by the user and mathematically evaluated by R3VIVE's deterministic engine.

ITEM SPECIFICATION:
- Name: {payload.item_name}
- Category: {payload.category}
- Model/Brand: {payload.brand_model or 'Not specified'}
- Age: {payload.age or 'Not specified'}
- Physical Condition: {payload.condition}
- Reported Defect: {payload.reported_fault}
- Repair Cost: {f"₹{payload.repair_cost}" if (payload.repair_cost and not payload.repair_cost_unknown) else 'Unknown / Not provided'}
- Replacement Cost: {f"₹{payload.replacement_cost}" if (payload.replacement_cost and not payload.replacement_cost_unknown) else 'Unknown / Not provided'}
- User Stated Priority: {payload.primary_priority or 'General circular maintenance'}

DETERMINISTIC EVALUATION:
- Algorithmic Recommended Pathway: {payload.recommended_outcome}
- User's Selected Execution Strategy: {payload.selected_outcome} ({payload.selected_branch_title or 'Standard execution'})

STRICT GUIDELINES:
1. The mathematical recommendation is ALREADY SET. Do NOT contradict, change, or dispute the selected/recommended outcome.
2. Ground all advice strictly in the specific item, category, and reported defect.
3. NEVER invent costs, savings percentages, or measurements that were marked unknown.
4. If hazardous conditions (swollen battery, burning, sparks, smoke, chemical leaks) are present, prioritize safety over repair.
5. Return ONLY a valid JSON object matching the requested schema.

SCHEMA:
{{
  "summary_verdict": "Clear, grounded 2-sentence actionable assessment of this item's pathway.",
  "practical_steps": ["step 1 (practical workshop tip)", "step 2", "step 3"],
  "safety_cautions": ["caution 1 (specific safety risk for this hardware)", "caution 2"],
  "cost_carbon_insight": "Honest explanation of the financial or circular value without invented figures."
}}
"""

        response = client.models.generate_content(
            model=GEMINI_MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                http_options={"timeout": 15000},
            ),
        )

        if not response or not response.text:
            raise ValueError("Empty response received from Gemini.")

        # Strict validation of AI response structure
        parsed_data = json.loads(response.text)
        validated_ai = StructuredAiGuidance.model_validate(parsed_data)

        # Merge deterministic safety requirements so model hallucinations cannot suppress critical hazards
        combined_safety = get_mandatory_safety_precautions(payload)
        for c in validated_ai.safety_cautions:
            if c not in combined_safety:
                combined_safety.append(c)

        result = DecisionGuidanceResponse(
            ai_available=True,
            source=GEMINI_MODEL_ID,
            summary_verdict=validated_ai.summary_verdict,
            practical_steps=validated_ai.practical_steps,
            safety_cautions=combined_safety,
            cost_carbon_insight=validated_ai.cost_carbon_insight,
            model_version=GEMINI_MODEL_ID,
            note=f"Powered by Gemini ({GEMINI_MODEL_ID}) grounded in deterministic assessment inputs.",
        )

        # Store in cache
        if len(_guidance_cache) >= _MAX_CACHE_SIZE:
            _guidance_cache.pop(next(iter(_guidance_cache)))
        _guidance_cache[cache_key] = result
        return result

    except Exception as e:
        error_type = type(e).__name__
        logger.warning(f"Gemini API guidance call failed ({error_type}): {str(e)[:120]}. Falling back to deterministic rules.")
        
        fallback = generate_deterministic_guidance(payload)
        
        # Transparent, honest note about the fallback reason
        if "429" in str(e) or "ResourceExhausted" in error_type or "Quota" in str(e):
            fallback.note = "Deterministic fallback active (AI service quota or rate limit reached; deterministic rules engaged)."
        elif "504" in str(e) or "DEADLINE_EXCEEDED" in str(e) or "Timeout" in error_type:
            fallback.note = f"Deterministic fallback active (AI gateway timeout on {GEMINI_MODEL_ID}; deterministic rules engaged)."
        else:
            fallback.note = f"Deterministic fallback active (AI service unavailable: {error_type})."
            
        # Cache fallback to prevent retry storm on subsequent renders
        _guidance_cache[cache_key] = fallback
        return fallback
