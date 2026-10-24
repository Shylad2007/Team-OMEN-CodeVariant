from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

class AssessmentBase(BaseModel):
    # Stage 1: Item Identity
    item_name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1, max_length=50)
    custom_category: Optional[str] = None
    brand_model: Optional[str] = None

    # Stage 2: Condition & Malfunction
    age: Optional[str] = None
    condition: str = Field(..., min_length=1, max_length=50)
    reported_fault: str = Field(..., min_length=1, max_length=2000)

    # Stage 3: Circumstances & Economics
    repair_cost: Optional[float] = None
    repair_cost_unknown: bool = False
    replacement_cost: Optional[float] = None
    replacement_cost_unknown: bool = False
    expected_lifespan_years: Optional[int] = None
    expected_lifespan_unknown: bool = False
    budget_constraint: Optional[str] = None
    urgency: Optional[str] = None
    primary_priority: Optional[str] = None

    # Stage 4: Adaptive Diagnostic Answers
    adaptive_answers: Dict[str, Any] = Field(default_factory=dict)

    # Decision Tree & Progress State
    current_step: int = Field(default=1, ge=1, le=5)
    is_completed: bool = False
    recommended_outcome: Optional[str] = None
    selected_outcome: Optional[str] = None
    selected_branch_id: Optional[str] = None
    checklist_progress: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AssessmentCreate(AssessmentBase):
    id: Optional[str] = None  # Optional client-provided UUID to avoid duplicates on retries

class AssessmentUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    custom_category: Optional[str] = None
    brand_model: Optional[str] = None
    age: Optional[str] = None
    condition: Optional[str] = None
    reported_fault: Optional[str] = None
    repair_cost: Optional[float] = None
    repair_cost_unknown: Optional[bool] = None
    replacement_cost: Optional[float] = None
    replacement_cost_unknown: Optional[bool] = None
    expected_lifespan_years: Optional[int] = None
    expected_lifespan_unknown: Optional[bool] = None
    budget_constraint: Optional[str] = None
    urgency: Optional[str] = None
    primary_priority: Optional[str] = None
    adaptive_answers: Optional[Dict[str, Any]] = None
    current_step: Optional[int] = None
    is_completed: Optional[bool] = None
    recommended_outcome: Optional[str] = None
    selected_outcome: Optional[str] = None
    selected_branch_id: Optional[str] = None
    checklist_progress: Optional[Dict[str, Any]] = None

class AssessmentResponse(AssessmentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AssessmentSummary(BaseModel):
    id: str
    item_name: str
    category: str
    condition: str
    brand_model: Optional[str] = None
    current_step: int
    is_completed: bool
    recommended_outcome: Optional[str] = None
    selected_outcome: Optional[str] = None
    selected_branch_id: Optional[str] = None
    updated_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class AssessmentListResponse(BaseModel):
    items: List[AssessmentSummary]
    total: int
