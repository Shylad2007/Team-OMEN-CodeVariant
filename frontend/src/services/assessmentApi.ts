import { supabase } from '../lib/supabase';
import type { AssessmentData, ItemCategoryId, ConditionGradeId } from '../components/assessment/types';

const API_BASE = 'http://127.0.0.1:8000/api/assessments';

export interface PersistentAssessment {
  id: string;
  user_id: string;
  item_name: string;
  category: ItemCategoryId;
  custom_category: string | null;
  brand_model: string | null;
  age: string | null;
  condition: ConditionGradeId;
  reported_fault: string;
  repair_cost: number | null;
  repair_cost_unknown: boolean;
  replacement_cost: number | null;
  replacement_cost_unknown: boolean;
  expected_lifespan_years: number | null;
  expected_lifespan_unknown: boolean;
  budget_constraint: string | null;
  urgency: string | null;
  primary_priority: string | null;
  adaptive_answers: Record<string, string>;
  current_step: number;
  is_completed: boolean;
  recommended_outcome: string | null;
  selected_outcome: string | null;
  selected_branch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSummaryItem {
  id: string;
  item_name: string;
  category: ItemCategoryId;
  condition: ConditionGradeId;
  brand_model: string | null;
  current_step: number;
  is_completed: boolean;
  recommended_outcome: string | null;
  selected_outcome: string | null;
  selected_branch_id: string | null;
  updated_at: string;
  created_at: string;
}

export const LOCAL_STORAGE_ASSESSMENTS_KEY = 'r3vive_local_assessments';

/**
 * Generates an RFC 4122 v4 UUID or compliant fallback ID.
 */
export function generateAssessmentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'assess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
}

/**
 * Lists all assessments cached in local storage (for guest users and offline resilience).
 */
export function listLocalAssessments(): AssessmentSummaryItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_ASSESSMENTS_KEY);
    if (!raw) return [];
    const map: Record<string, PersistentAssessment> = JSON.parse(raw);
    const items: AssessmentSummaryItem[] = Object.values(map).map((rec) => ({
      id: rec.id,
      item_name: rec.item_name,
      category: rec.category,
      condition: rec.condition,
      brand_model: rec.brand_model,
      current_step: rec.current_step,
      is_completed: rec.is_completed,
      recommended_outcome: rec.recommended_outcome,
      selected_outcome: rec.selected_outcome,
      selected_branch_id: rec.selected_branch_id,
      updated_at: rec.updated_at,
      created_at: rec.created_at,
    }));
    return items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } catch {
    return [];
  }
}

/**
 * Retrieves a single assessment from local storage by ID.
 */
export function getLocalAssessment(id: string): PersistentAssessment | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(LOCAL_STORAGE_ASSESSMENTS_KEY);
    if (!raw) return null;
    const map: Record<string, PersistentAssessment> = JSON.parse(raw);
    return map[id] || null;
  } catch {
    return null;
  }
}

/**
 * Persists an assessment record to local storage.
 */
export function saveLocalAssessment(record: PersistentAssessment): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(LOCAL_STORAGE_ASSESSMENTS_KEY);
    const map: Record<string, PersistentAssessment> = raw ? JSON.parse(raw) : {};
    map[record.id] = {
      ...record,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_ASSESSMENTS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Deletes an assessment from local storage.
 */
export function deleteLocalAssessment(id: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(LOCAL_STORAGE_ASSESSMENTS_KEY);
    if (!raw) return;
    const map: Record<string, PersistentAssessment> = JSON.parse(raw);
    delete map[id];
    localStorage.setItem(LOCAL_STORAGE_ASSESSMENTS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Transforms frontend AssessmentData and workflow state into database payload.
 */
export function toDatabasePayload(
  data: AssessmentData,
  options?: {
    id?: string;
    userId?: string;
    currentStep?: number;
    isCompleted?: boolean;
    recommendedOutcome?: string | null;
    selectedOutcome?: string | null;
    selectedBranchId?: string | null;
    checklistProgress?: Record<string, Record<number, boolean>>;
  }
) {
  // Clean frontend adaptive answers so internal metadata is separated
  const cleanAdaptive: Record<string, string> = {};
  for (const [k, v] of Object.entries(data.adaptiveAnswers || {})) {
    if (!k.startsWith('_') && typeof v === 'string') {
      cleanAdaptive[k] = v;
    }
  }

  const mergedAdaptive = {
    ...cleanAdaptive,
    ...(options?.checklistProgress !== undefined
      ? { _checklist_progress: options.checklistProgress }
      : {}),
  };

  return {
    ...(options?.id ? { id: options.id } : {}),
    ...(options?.userId ? { user_id: options.userId } : {}),
    item_name: data.itemName.trim(),
    category: data.category,
    custom_category: data.customCategory?.trim() || null,
    brand_model: data.brandModel?.trim() || null,
    age: data.age || null,
    condition: data.condition,
    reported_fault: data.reportedFault.trim(),
    repair_cost: data.repairCostUnknown ? null : data.repairCost,
    repair_cost_unknown: data.repairCostUnknown,
    replacement_cost: data.replacementCostUnknown ? null : data.replacementCost,
    replacement_cost_unknown: data.replacementCostUnknown,
    expected_lifespan_years: data.expectedLifespanUnknown ? null : data.expectedLifespanYears,
    expected_lifespan_unknown: data.expectedLifespanUnknown,
    budget_constraint: data.budgetConstraint || null,
    urgency: data.urgency || null,
    primary_priority: data.primaryPriority || null,
    adaptive_answers: mergedAdaptive,
    current_step: options?.currentStep ?? 1,
    is_completed: options?.isCompleted ?? false,
    recommended_outcome: options?.recommendedOutcome || null,
    selected_outcome: options?.selectedOutcome || null,
    selected_branch_id: options?.selectedBranchId || null,
  };
}

/**
 * Transforms database record into frontend AssessmentData.
 */
export function fromDatabaseRecord(record: PersistentAssessment): {
  data: AssessmentData;
  currentStep: number;
  isCompleted: boolean;
  recommendedOutcome: string | null;
  selectedOutcome: string | null;
  selectedBranchId: string | null;
  checklistProgress: Record<string, Record<number, boolean>>;
} {
  const rawAdaptive = record.adaptive_answers || {};
  const extractedChecklist: Record<string, Record<number, boolean>> =
    (record as any).checklist_progress || rawAdaptive._checklist_progress || {};

  // Clean adaptive answers so UI and state never receive internal non-string metadata
  const cleanedAdaptive: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawAdaptive)) {
    if (!k.startsWith('_') && typeof v === 'string') {
      cleanedAdaptive[k] = v;
    }
  }

  return {
    data: {
      itemName: record.item_name || '',
      category: record.category,
      customCategory: record.custom_category || '',
      brandModel: record.brand_model || '',
      age: (record.age as any) || null,
      condition: record.condition,
      reportedFault: record.reported_fault || '',
      repairCost: record.repair_cost,
      repairCostUnknown: Boolean(record.repair_cost_unknown),
      replacementCost: record.replacement_cost,
      replacementCostUnknown: Boolean(record.replacement_cost_unknown),
      expectedLifespanYears: record.expected_lifespan_years,
      expectedLifespanUnknown: Boolean(record.expected_lifespan_unknown),
      budgetConstraint: (record.budget_constraint as any) || null,
      urgency: (record.urgency as any) || null,
      primaryPriority: (record.primary_priority as any) || null,
      adaptiveAnswers: cleanedAdaptive,
    },
    currentStep: record.current_step || 1,
    isCompleted: Boolean(record.is_completed),
    recommendedOutcome: typeof record.recommended_outcome === 'string' ? record.recommended_outcome : null,
    selectedOutcome: typeof record.selected_outcome === 'string' ? record.selected_outcome : null,
    selectedBranchId: typeof record.selected_branch_id === 'string' ? record.selected_branch_id : null,
    checklistProgress: extractedChecklist,
  };
}

/**
 * Creates or upserts an assessment via the FastAPI backend with Supabase client fallback.
 */
export async function createAssessment(
  data: AssessmentData,
  token?: string,
  options?: {
    id?: string;
    userId?: string;
    currentStep?: number;
    isCompleted?: boolean;
    recommendedOutcome?: string | null;
    selectedOutcome?: string | null;
    selectedBranchId?: string | null;
    checklistProgress?: Record<string, Record<number, boolean>>;
  }
): Promise<PersistentAssessment> {
  const payload = toDatabasePayload(data, options);
  const now = new Date().toISOString();
  const fallbackRecord: PersistentAssessment = {
    id: options?.id || generateAssessmentId(),
    user_id: options?.userId || 'local-guest',
    item_name: data.itemName.trim(),
    category: data.category!,
    custom_category: data.customCategory?.trim() || null,
    brand_model: data.brandModel?.trim() || null,
    age: data.age || null,
    condition: data.condition!,
    reported_fault: data.reportedFault.trim(),
    repair_cost: data.repairCostUnknown ? null : data.repairCost,
    repair_cost_unknown: data.repairCostUnknown,
    replacement_cost: data.replacementCostUnknown ? null : data.replacementCost,
    replacement_cost_unknown: data.replacementCostUnknown,
    expected_lifespan_years: data.expectedLifespanUnknown ? null : data.expectedLifespanYears,
    expected_lifespan_unknown: data.expectedLifespanUnknown,
    budget_constraint: data.budgetConstraint || null,
    urgency: data.urgency || null,
    primary_priority: data.primaryPriority || null,
    adaptive_answers: payload.adaptive_answers as Record<string, string>,
    current_step: options?.currentStep ?? 1,
    is_completed: options?.isCompleted ?? false,
    recommended_outcome: options?.recommendedOutcome || null,
    selected_outcome: options?.selectedOutcome || null,
    selected_branch_id: options?.selectedBranchId || null,
    created_at: now,
    updated_at: now,
  };

  if (!token) {
    saveLocalAssessment(fallbackRecord);
    return fallbackRecord;
  }

  // 1. Primary: Authenticated FastAPI Backend (forwards bearer token with PostgREST RLS)
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const created = await res.json();
      saveLocalAssessment(created);
      return created;
    } else {
      const errText = await res.text().catch(() => '');
      console.warn(`[API] Backend POST failed (${res.status}): ${errText}`);
    }
  } catch (netErr) {
    console.warn('[API] Backend unreachable, falling back to direct Supabase client:', netErr);
  }

  // 2. Fallback: Direct Supabase client using active user JWT & RLS
  let resolvedUserId = payload.user_id;
  if (!resolvedUserId) {
    const { data: userData } = await supabase.auth.getUser();
    resolvedUserId = userData.user?.id;
  }

  if (!resolvedUserId) {
    saveLocalAssessment(fallbackRecord);
    return fallbackRecord;
  }

  const directPayload = {
    ...payload,
    user_id: resolvedUserId,
  };

  const { data: record, error } = await supabase
    .from('assessments')
    .upsert(directPayload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    saveLocalAssessment(fallbackRecord);
    return fallbackRecord;
  }
  const createdRecord = record as PersistentAssessment;
  saveLocalAssessment(createdRecord);
  return createdRecord;
}

/**
 * Updates an existing assessment by ID.
 */
export async function updateAssessment(
  id: string,
  partialData: Partial<ReturnType<typeof toDatabasePayload>>,
  token?: string
): Promise<PersistentAssessment> {
  if (!token) {
    const existing = getLocalAssessment(id);
    if (existing) {
      const updated: PersistentAssessment = {
        ...existing,
        ...partialData,
        updated_at: new Date().toISOString(),
      } as PersistentAssessment;
      saveLocalAssessment(updated);
      return updated;
    }
    throw new Error('Local assessment record not found');
  }

  // 1. Primary: Authenticated FastAPI Backend
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(partialData),
    });

    if (res.ok) {
      const updated = await res.json();
      saveLocalAssessment(updated);
      return updated;
    } else {
      const errText = await res.text().catch(() => '');
      console.warn(`[API] Backend PUT failed (${res.status}): ${errText}`);
    }
  } catch (netErr) {
    console.warn('[API] Backend unreachable, falling back to direct Supabase client:', netErr);
  }

  // 2. Fallback: Direct Supabase client
  const { data: record, error } = await supabase
    .from('assessments')
    .update(partialData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const existing = getLocalAssessment(id);
    if (existing) {
      const updated: PersistentAssessment = {
        ...existing,
        ...partialData,
        updated_at: new Date().toISOString(),
      } as PersistentAssessment;
      saveLocalAssessment(updated);
      return updated;
    }
    throw new Error(error.message);
  }
  const updatedRecord = record as PersistentAssessment;
  saveLocalAssessment(updatedRecord);
  return updatedRecord;
}

/**
 * Retrieves a single assessment by ID.
 */
export async function getAssessment(id: string, token?: string): Promise<PersistentAssessment> {
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const fetched = await res.json();
        saveLocalAssessment(fetched);
        return fetched;
      }
      if (res.status === 404) {
        throw new Error('Assessment not found or access denied.');
      }
    } catch (err: any) {
      if (err.message?.includes('not found')) throw err;
    }

    const { data: record, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && record) {
      const fetched = record as PersistentAssessment;
      saveLocalAssessment(fetched);
      return fetched;
    }
  }

  // Fallback to local storage
  const local = getLocalAssessment(id);
  if (local) {
    return local;
  }

  throw new Error('Assessment record not found');
}

/**
 * Lists all assessments for the authenticated user.
 */
export async function listUserAssessments(token?: string): Promise<AssessmentSummaryItem[]> {
  if (!token) {
    return listLocalAssessments();
  }

  try {
    const res = await fetch(API_BASE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const items: AssessmentSummaryItem[] = data.items || [];
      return items;
    }
  } catch {
    // Fallback to Supabase client
  }

  const { data: records, error } = await supabase
    .from('assessments')
    .select('id, item_name, category, condition, brand_model, current_step, is_completed, recommended_outcome, selected_outcome, selected_branch_id, updated_at, created_at')
    .order('updated_at', { ascending: false });

  if (error) {
    const local = listLocalAssessments();
    if (local.length > 0) return local;
    throw new Error(error.message);
  }
  return (records || []) as AssessmentSummaryItem[];
}

/**
 * Deletes an assessment by ID.
 */
export async function deleteAssessment(id: string, token?: string): Promise<void> {
  deleteLocalAssessment(id);

  if (!token) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 204 || res.ok) {
      return;
    }
  } catch {
    // Fallback to Supabase
  }

  const { error } = await supabase.from('assessments').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export interface DecisionGuidancePayload {
  item_name: string;
  category: string;
  brand_model?: string | null;
  condition: string;
  reported_fault: string;
  age?: string | null;
  repair_cost?: number | null;
  repair_cost_unknown?: boolean;
  replacement_cost?: number | null;
  replacement_cost_unknown?: boolean;
  budget_constraint?: string | null;
  urgency?: string | null;
  primary_priority?: string | null;
  recommended_outcome: string;
  selected_outcome: string;
  selected_branch_title?: string | null;
}

export interface DecisionGuidanceResult {
  ai_available: boolean;
  source: string;
  summary_verdict: string;
  practical_steps: string[];
  safety_cautions: string[];
  cost_carbon_insight: string;
  model_version?: string | null;
  note?: string | null;
}

/**
 * Fetches contextual decision intelligence guidance from the backend.
 * Uses Gemini (gemini-3.8-flash) if available, or deterministic expert fallback.
 */
export async function getDecisionAiGuidance(
  payload: DecisionGuidancePayload,
  token?: string
): Promise<DecisionGuidanceResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/ai-guidance`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Failed to retrieve decision guidance (${res.status}): ${errorBody}`);
  }

  return await res.json();
}
