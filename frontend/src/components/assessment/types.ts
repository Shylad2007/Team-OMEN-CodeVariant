export type AssessmentStage = 1 | 2 | 3 | 4 | 5;

export type ItemCategoryId = 
  | 'electronics'
  | 'appliances'
  | 'clothing'
  | 'furniture'
  | 'tools'
  | 'other';

export interface CategoryOption {
  id: ItemCategoryId;
  label: string;
  iconName: string;
  description: string;
  examples: string;
}

export type ItemAgeId = 
  | 'under_1_year'
  | '1_to_3_years'
  | '3_to_5_years'
  | '5_to_10_years'
  | 'over_10_years'
  | 'unknown';

export type ConditionGradeId = 
  | 'mint_minor_issue'
  | 'partially_functional'
  | 'broken_non_functional'
  | 'severe_structural_failure';

export interface ConditionOption {
  id: ConditionGradeId;
  label: string;
  badge: string;
  badgeColor: string;
  description: string;
}

export type BudgetConstraint = 'minimal' | 'moderate' | 'flexible' | 'none';
export type UrgencyLevel = 'urgent' | 'moderate' | 'flexible';
export type PrimaryPriority = 'save_money' | 'extend_lifespan' | 'reduce_waste' | 'convenience';

export interface AdaptiveQuestionOption {
  value: string;
  label: string;
  hint?: string;
  branchEffect?: string;
}

export interface AdaptiveQuestion {
  id: string;
  categoryId: ItemCategoryId | 'all';
  title: string;
  subtitle: string;
  explanation: string;
  condition?: (data: AssessmentData) => boolean;
  options: AdaptiveQuestionOption[];
}

export interface AssessmentData {
  // Stage 1: Item Identity
  itemName: string;
  category: ItemCategoryId | null;
  customCategory?: string;
  brandModel?: string;

  // Stage 2: Condition & Fault
  age: ItemAgeId | null;
  condition: ConditionGradeId | null;
  reportedFault: string;

  // Stage 3: Circumstances & Economics
  repairCost: number | null; // null if unknown
  repairCostUnknown: boolean;
  replacementCost: number | null; // null if unknown
  replacementCostUnknown: boolean;
  expectedLifespanYears: number | null; // null if unknown
  expectedLifespanUnknown: boolean;
  budgetConstraint: BudgetConstraint | null;
  urgency: UrgencyLevel | null;
  primaryPriority: PrimaryPriority | null;

  // Stage 4: Category Adaptive Answers
  adaptiveAnswers: Record<string, string>;
}
