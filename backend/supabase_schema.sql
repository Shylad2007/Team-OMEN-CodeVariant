-- ==============================================================================
-- R3VIVE: Phase 7 — Item Assessment Persistence Schema & RLS Policies
-- ==============================================================================

-- 1. Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Stage 1: Item Identity
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    custom_category TEXT DEFAULT NULL,
    brand_model TEXT DEFAULT NULL,
    
    -- Stage 2: Condition & Malfunction
    age TEXT DEFAULT NULL,
    condition TEXT NOT NULL,
    reported_fault TEXT NOT NULL,
    
    -- Stage 3: Circumstances & Economics
    repair_cost NUMERIC DEFAULT NULL,
    repair_cost_unknown BOOLEAN DEFAULT FALSE,
    replacement_cost NUMERIC DEFAULT NULL,
    replacement_cost_unknown BOOLEAN DEFAULT FALSE,
    expected_lifespan_years INTEGER DEFAULT NULL,
    expected_lifespan_unknown BOOLEAN DEFAULT FALSE,
    budget_constraint TEXT DEFAULT NULL,
    urgency TEXT DEFAULT NULL,
    primary_priority TEXT DEFAULT NULL,
    
    -- Stage 4: Adaptive Diagnostic Answers
    adaptive_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Decision Tree & Progress State
    current_step INTEGER NOT NULL DEFAULT 1,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    recommended_outcome TEXT DEFAULT NULL,
    selected_outcome TEXT DEFAULT NULL,
    selected_branch_id TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast user queries and dashboard sorting
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_updated_at ON public.assessments(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_is_completed ON public.assessments(is_completed);

-- 3. Enable Row Level Security (RLS) & Ensure Default User ID
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS checklist_progress JSONB DEFAULT '{}'::jsonb;

-- 4. Clean existing policies if re-running
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can delete their own assessments" ON public.assessments;

-- 5. Row Level Security Policies (Enforce Strict Ownership)
CREATE POLICY "Users can view their own assessments"
    ON public.assessments
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
    ON public.assessments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
    ON public.assessments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
    ON public.assessments
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Trigger for automatic updated_at timestamp maintenance
CREATE OR REPLACE FUNCTION public.handle_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assessments_updated_at ON public.assessments;
CREATE TRIGGER trigger_assessments_updated_at
    BEFORE UPDATE ON public.assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_assessments_updated_at();
