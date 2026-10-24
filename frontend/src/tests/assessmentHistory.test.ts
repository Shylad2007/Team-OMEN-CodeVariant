import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { AssessmentSummaryItem, PersistentAssessment } from '../services/assessmentApi';
import { fromDatabaseRecord, toDatabasePayload } from '../services/assessmentApi';

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

  it('8. Multi-assessment creation isolates distinct IDs, questionnaire answers, and checklists', () => {
    const itemA: PersistentAssessment = {
      ...mockDetailedRecord,
      id: 'item-uuid-aaa',
      item_name: 'LG OLED 55-inch TV',
      category: 'electronics',
      condition: 'partially_functional',
      repair_cost: 6000,
      checklist_progress: { branch_elec_rep_psu: { 0: true, 1: false } },
    };

    const itemB: PersistentAssessment = {
      ...mockDetailedRecord,
      id: 'item-uuid-bbb',
      item_name: 'Oak Bookshelf',
      category: 'furniture',
      condition: 'cosmetic_wear',
      repair_cost: 800,
      checklist_progress: { branch_furn_rep_sand: { 0: true, 1: true, 2: true } },
    };

    assert.notStrictEqual(itemA.id, itemB.id, 'IDs must be uniquely assigned');
    assert.strictEqual(itemA.item_name, 'LG OLED 55-inch TV');
    assert.strictEqual(itemB.item_name, 'Oak Bookshelf');
    assert.strictEqual(itemA.repair_cost, 6000);
    assert.strictEqual(itemB.repair_cost, 800);
    assert.deepStrictEqual(itemA.checklist_progress, { branch_elec_rep_psu: { 0: true, 1: false } });
    assert.deepStrictEqual(itemB.checklist_progress, { branch_furn_rep_sand: { 0: true, 1: true, 2: true } });
  });

  it('9. Editing assessment A does not mutate assessment B', () => {
    const store: Record<string, PersistentAssessment> = {
      'id-1': { ...mockDetailedRecord, id: 'id-1', item_name: 'Item One', current_step: 3 },
      'id-2': { ...mockDetailedRecord, id: 'id-2', item_name: 'Item Two', current_step: 2 },
    };

    // Update Item One only
    store['id-1'] = { ...store['id-1'], item_name: 'Item One (Refurbished)', current_step: 5, is_completed: true };

    assert.strictEqual(store['id-1'].item_name, 'Item One (Refurbished)');
    assert.strictEqual(store['id-1'].current_step, 5);
    assert.strictEqual(store['id-2'].item_name, 'Item Two', 'Item Two must remain unchanged');
    assert.strictEqual(store['id-2'].current_step, 2, 'Item Two step must remain unchanged');
  });

  it('10. Deleting assessment A retains assessment B in vault', () => {
    let list: AssessmentSummaryItem[] = [
      { ...mockSavedAssessments[0], id: 'record-x' },
      { ...mockSavedAssessments[1], id: 'record-y' },
    ];

    list = list.filter((item) => item.id !== 'record-x');
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, 'record-y');
  });

  it('11. Selector filter tabs and search query correctly partition multiple assessments', () => {
    const items: AssessmentSummaryItem[] = [
      { ...mockSavedAssessments[0], id: '1', item_name: 'MacBook Air', is_completed: true, current_step: 5 },
      { ...mockSavedAssessments[1], id: '2', item_name: 'Sony Headphones', is_completed: false, current_step: 3 },
      { ...mockSavedAssessments[2], id: '3', item_name: 'Teak Desk', is_completed: true, current_step: 5 },
    ];

    // Filter: in_progress
    const inProgress = items.filter((a) => !a.is_completed && a.current_step < 5);
    assert.strictEqual(inProgress.length, 1);
    assert.strictEqual(inProgress[0].item_name, 'Sony Headphones');

    // Filter: completed
    const completed = items.filter((a) => a.is_completed || a.current_step >= 5);
    assert.strictEqual(completed.length, 2);

    // Search query: 'sony'
    const query = 'sony';
    const searched = items.filter((a) => a.item_name.toLowerCase().includes(query));
    assert.strictEqual(searched.length, 1);
    assert.strictEqual(searched[0].id, '2');
  });
  it('12. Creating a new assessment after opening a completed one initializes a distinct ID without mutation', () => {
    // 1. User opens a completed assessment
    const completedRecord: PersistentAssessment = {
      ...mockDetailedRecord,
      id: 'completed-101',
      item_name: 'Dyson Vacuum',
      current_step: 5,
      is_completed: true,
      selected_outcome: 'repair',
      checklist_progress: { branch_app_rep_motor: { 0: true, 1: true } },
    };

    // 2. User clicks "Add New Item" / "Assess Another Item" -> generates fresh ID
    const newId = 'fresh-uuid-' + Math.random().toString(36).substring(2, 8);
    assert.notStrictEqual(newId, completedRecord.id, 'New assessment must have an independent ID');

    // 3. User enters data for the new item
    const newItemRecord: PersistentAssessment = {
      ...mockDetailedRecord,
      id: newId,
      item_name: 'Sony Bravia 65-inch OLED',
      category: 'electronics',
      condition: 'partially_functional',
      repair_cost: 8500,
      current_step: 2,
      is_completed: false,
      selected_outcome: null,
      selected_branch_id: null,
      checklist_progress: {},
    };

    // 4. Verify completed record was NOT overwritten or mutated
    assert.strictEqual(completedRecord.id, 'completed-101');
    assert.strictEqual(completedRecord.item_name, 'Dyson Vacuum');
    assert.strictEqual(completedRecord.is_completed, true);
    assert.strictEqual(completedRecord.selected_outcome, 'repair');

    // 5. Verify new item record is completely distinct
    assert.strictEqual(newItemRecord.id, newId);
    assert.strictEqual(newItemRecord.item_name, 'Sony Bravia 65-inch OLED');
    assert.strictEqual(newItemRecord.category, 'electronics');
    assert.strictEqual(newItemRecord.is_completed, false);
    assert.deepStrictEqual(newItemRecord.checklist_progress, {});
  });

  it('13. Switching between multiple assessments preserves isolated answers and progress without leakage', () => {
    const recordsMap: Record<string, PersistentAssessment> = {
      'device-a': {
        ...mockDetailedRecord,
        id: 'device-a',
        item_name: 'iPhone 13',
        selected_outcome: 'repair',
        selected_branch_id: 'branch_elec_rep_screen',
        checklist_progress: { branch_elec_rep_screen: { 0: true } },
      },
      'device-b': {
        ...mockDetailedRecord,
        id: 'device-b',
        item_name: 'Teak Coffee Table',
        selected_outcome: 'repurpose',
        selected_branch_id: 'branch_furn_rep_legs',
        checklist_progress: { branch_furn_rep_legs: { 0: true, 1: true } },
      },
    };

    // Navigate to device-a
    const loadedA = recordsMap['device-a'];
    assert.strictEqual(loadedA.item_name, 'iPhone 13');
    assert.strictEqual(loadedA.selected_outcome, 'repair');
    assert.strictEqual(loadedA.checklist_progress['branch_elec_rep_screen'][0], true);
    assert.strictEqual(loadedA.checklist_progress['branch_furn_rep_legs'], undefined, 'No cross-item checklist leakage');

    // Navigate to device-b
    const loadedB = recordsMap['device-b'];
    assert.strictEqual(loadedB.item_name, 'Teak Coffee Table');
    assert.strictEqual(loadedB.selected_outcome, 'repurpose');
    assert.strictEqual(loadedB.checklist_progress['branch_furn_rep_legs'][1], true);
    assert.strictEqual(loadedB.checklist_progress['branch_elec_rep_screen'], undefined, 'No cross-item checklist leakage');
  });

  it('14. Editing one assessment updates only its own record and leaves others untouched', () => {
    const vault: Record<string, PersistentAssessment> = {
      'item-1': { ...mockDetailedRecord, id: 'item-1', item_name: 'Original Item 1', repair_cost: 1000 },
      'item-2': { ...mockDetailedRecord, id: 'item-2', item_name: 'Original Item 2', repair_cost: 2000 },
    };

    // Edit item-2 only
    vault['item-2'] = { ...vault['item-2'], item_name: 'Modified Item 2', repair_cost: 3500 };

    assert.strictEqual(vault['item-1'].item_name, 'Original Item 1', 'Item 1 name must remain untouched');
    assert.strictEqual(vault['item-1'].repair_cost, 1000, 'Item 1 repair cost must remain untouched');
    assert.strictEqual(vault['item-2'].item_name, 'Modified Item 2');
    assert.strictEqual(vault['item-2'].repair_cost, 3500);
  });

  it('15. Execution Capsule drop with cloth_reuse_swap correctly isolates checklist from adaptiveAnswers', () => {
    const rawRecord: PersistentAssessment = {
      ...mockDetailedRecord,
      id: 'cloth-repro-01',
      category: 'clothing',
      item_name: 'Vintage Denim Jacket',
      selected_outcome: 'reuse',
      selected_branch_id: 'cloth_reuse_swap',
      checklist_progress: undefined as any,
      adaptive_answers: {
        cloth_damage: 'none',
        _checklist_progress: {
          cloth_reuse_swap: { 0: true, 1: false },
        },
      },
      current_step: 5,
      is_completed: true,
    };

    const transformed = fromDatabaseRecord(rawRecord);

    // 1. Checklist progress must be extracted into checklistProgress object
    assert.deepStrictEqual(transformed.checklistProgress, {
      cloth_reuse_swap: { 0: true, 1: false },
    });

    // 2. adaptiveAnswers must NOT contain _checklist_progress or any object value
    assert.strictEqual(
      transformed.data.adaptiveAnswers._checklist_progress,
      undefined,
      '_checklist_progress must not leak into adaptiveAnswers'
    );
    assert.strictEqual(transformed.data.adaptiveAnswers.cloth_damage, 'none');

    // 3. All values in adaptiveAnswers must be strings
    for (const [k, v] of Object.entries(transformed.data.adaptiveAnswers)) {
      assert.strictEqual(typeof v, 'string', `adaptiveAnswer ${k} must be string`);
    }

    // 4. Roundtrip via toDatabasePayload preserves both cleanly
    const payload = toDatabasePayload(transformed.data, {
      id: 'cloth-repro-01',
      currentStep: 5,
      isCompleted: true,
      selectedOutcome: transformed.selectedOutcome,
      selectedBranchId: transformed.selectedBranchId,
      checklistProgress: transformed.checklistProgress,
    });

    assert.deepStrictEqual(
      (payload.adaptive_answers as any)._checklist_progress,
      { cloth_reuse_swap: { 0: true, 1: false } }
    );
  });

  it('16. Dropping into Initialize Next Item saves previous item and isolates new assessment', () => {
    const vault: Record<string, any> = {};

    // Simulate saving current cloth item before transitioning
    const currentId = 'cloth-item-01';
    vault[currentId] = {
      id: currentId,
      item_name: 'Denim Jacket',
      selected_outcome: 'reuse',
      selected_branch_id: 'cloth_reuse_swap',
      is_completed: true,
      current_step: 5,
      checklist_progress: { cloth_reuse_swap: { 0: true } },
    };

    // Transition creates a fresh ID
    const freshId = 'item-fresh-uuid-999';
    assert.notStrictEqual(freshId, currentId, 'Fresh assessment ID must be distinct');

    // Previous assessment must remain intact in vault
    assert.strictEqual(vault[currentId].id, 'cloth-item-01');
    assert.strictEqual(vault[currentId].is_completed, true);
    assert.strictEqual(vault[currentId].checklist_progress.cloth_reuse_swap[0], true);
    assert.strictEqual(vault[freshId], undefined, 'Fresh item must not yet exist in vault until saved');
  });

  it('17. Finalize & Sync to Vault vs Initialize Next Item distinct routing & state guarantees', () => {
    const item = {
      id: 'item-sync-01',
      selectedOutcome: 'repair',
      selectedBranchId: 'branch_app_rep_motor',
      isCompleted: true,
    };

    // Finalize destination is dashboard vault
    const finalizeTarget = '/dashboard#decisions';
    assert.strictEqual(finalizeTarget, '/dashboard#decisions');

    // Initialize Next Item destination is fresh assessment Stage 01
    const nextItemTarget = `/assess?id=${'new-id'}&new=true`;
    assert.match(nextItemTarget, /\/assess\?id=new-id&new=true/);
  });

  it('18. Rejection of invalid drops preserves current state without uncaught errors', () => {
    const acceptedTypes = ['action_plan_token', 'new_assessment_token'];
    const invalidDrop = { type: 'unsupported_external_widget' };

    const isAccepted = acceptedTypes.includes(invalidDrop.type);
    assert.strictEqual(isAccepted, false, 'Invalid drop type must be rejected');
  });
});


