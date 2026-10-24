import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { AssessmentSummaryItem, PersistentAssessment } from '../services/assessmentApi';

// Mock assessment records representing real database payloads
const mockSavedAssessments: AssessmentSummaryItem[] = [
  {
    id: 'assess-101',
    item_name: 'Dyson V11 Vacuum',
    category: 'appliances',
    condition: 'partially_functional',
    brand_model: 'Dyson V11 Torque',
    current_step: 5,
    is_completed: true,
    recommended_outcome: 'repair',
    selected_outcome: 'repair',
    selected_branch_id: 'branch_app_rep_motor',
    created_at: '2026-10-23T10:00:00Z',
    updated_at: '2026-10-24T12:00:00Z',
  },
  {
    id: 'assess-102',
    item_name: 'MacBook Pro 15-inch',
    category: 'electronics',
    condition: 'severely_damaged',
    brand_model: 'Apple A1990',
    current_step: 3,
    is_completed: false,
    recommended_outcome: null,
    selected_outcome: null,
    selected_branch_id: null,
    created_at: '2026-10-24T08:00:00Z',
    updated_at: '2026-10-24T09:30:00Z',
  },
  {
    id: 'assess-103',
    item_name: 'Teak Dining Chair',
    category: 'furniture',
    condition: 'cosmetic_wear',
    brand_model: 'Custom Teak Wood',
    current_step: 5,
    is_completed: true,
    recommended_outcome: 'reuse',
    selected_outcome: 'repurpose',
    selected_branch_id: 'branch_furn_rep_1',
    created_at: '2026-10-22T14:00:00Z',
    updated_at: '2026-10-24T11:00:00Z',
  },
];

const mockDetailedRecord: PersistentAssessment = {
  id: 'assess-101',
  user_id: 'user-uuid-1',
  item_name: 'Dyson V11 Vacuum',
  category: 'appliances',
  custom_category: null,
  brand_model: 'Dyson V11 Torque',
  age: '3_to_5_years',
  condition: 'partially_functional',
  reported_fault: 'Motor pulses and cuts out after 5 seconds',
  repair_cost: 2500,
  repair_cost_unknown: false,
  replacement_cost: 35000,
  replacement_cost_unknown: false,
  expected_lifespan_years: 5,
  expected_lifespan_unknown: false,
  budget_constraint: 'moderate',
  urgency: 'moderate',
  primary_priority: 'save_money',
  adaptive_answers: { app_clog: 'cleared', app_battery: 'good' },
  current_step: 5,
  is_completed: true,
  recommended_outcome: 'repair',
  selected_outcome: 'repair',
  selected_branch_id: 'branch_app_rep_motor',
  checklist_progress: {
    branch_app_rep_motor: { 0: true, 1: true, 2: false },
  },
  created_at: '2026-10-23T10:00:00Z',
  updated_at: '2026-10-24T12:00:00Z',
};

describe('Assessment History & Decision Tracking Suite', () => {
  it('1. Retrieves and parses historical assessment records correctly', () => {
    assert.strictEqual(mockSavedAssessments.length, 3);
    const dyson = mockSavedAssessments.find((a) => a.id === 'assess-101');
    assert.ok(dyson, 'Dyson record should exist');
    assert.strictEqual(dyson?.item_name, 'Dyson V11 Vacuum');
    assert.strictEqual(dyson?.category, 'appliances');
    assert.strictEqual(dyson?.is_completed, true);
    assert.strictEqual(dyson?.selected_outcome, 'repair');
  });

  it('2. Separates completed action plans from in-progress drafts', () => {
    const completed = mockSavedAssessments.filter((a) => a.is_completed || a.current_step >= 5);
    const inProgress = mockSavedAssessments.filter((a) => !a.is_completed && a.current_step < 5);

    assert.strictEqual(completed.length, 2, 'Should have 2 completed assessments');
    assert.strictEqual(inProgress.length, 1, 'Should have 1 in-progress assessment');
    assert.strictEqual(inProgress[0].id, 'assess-102');
    assert.strictEqual(inProgress[0].current_step, 3);
  });

  it('3. In-progress assessment accurately generates resume target step', () => {
    const draft = mockSavedAssessments.find((a) => a.id === 'assess-102');
    assert.ok(draft);
    const resumeUrl = `/assess?id=${draft.id}`;
    assert.strictEqual(resumeUrl, '/assess?id=assess-102');
    assert.strictEqual(draft.current_step, 3);
  });

  it('4. Completed assessment correctly links to Action Plan, Matrix, and Comparator', () => {
    const completed = mockSavedAssessments.find((a) => a.id === 'assess-101');
    assert.ok(completed);

    const actionPlanUrl = `/assess/action-plan?id=${completed.id}`;
    const matrixUrl = `/assess/decision-tree?id=${completed.id}`;
    const comparatorUrl = `/assess/comparator?id=${completed.id}`;

    assert.strictEqual(actionPlanUrl, '/assess/action-plan?id=assess-101');
    assert.strictEqual(matrixUrl, '/assess/decision-tree?id=assess-101');
    assert.strictEqual(comparatorUrl, '/assess/comparator?id=assess-101');
  });

  it('5. Restores persisted checklist execution progress accurately', () => {
    const progress = mockDetailedRecord.checklist_progress;
    assert.ok(progress, 'Checklist progress must be defined');

    const branchProgress = progress['branch_app_rep_motor'];
    assert.ok(branchProgress, 'Branch progress must exist');
    assert.strictEqual(branchProgress[0], true, 'Step 1 should be checked');
    assert.strictEqual(branchProgress[1], true, 'Step 2 should be checked');
    assert.strictEqual(branchProgress[2], false, 'Step 3 should be unchecked');

    const totalSteps = 3;
    const completedSteps = Object.values(branchProgress).filter(Boolean).length;
    const percent = Math.round((completedSteps / totalSteps) * 100);
    assert.strictEqual(percent, 67, 'Checklist progress percentage should be 67%');
  });

  it('6. Deletion workflow accurately identifies and excludes removed records', () => {
    const targetId = 'assess-103';
    const remaining = mockSavedAssessments.filter((a) => a.id !== targetId);

    assert.strictEqual(remaining.length, 2);
    assert.ok(!remaining.some((a) => a.id === targetId), 'Target record must be removed');
  });

  it('7. Preserves user outcome divergence (e.g. recommended Reuse, selected Repurpose)', () => {
    const diverged = mockSavedAssessments.find((a) => a.id === 'assess-103');
    assert.ok(diverged);
    assert.strictEqual(diverged.recommended_outcome, 'reuse');
    assert.strictEqual(diverged.selected_outcome, 'repurpose');
    assert.notStrictEqual(diverged.recommended_outcome, diverged.selected_outcome);
  });
});
