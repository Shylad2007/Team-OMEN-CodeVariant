import type { ItemCategoryId, ConditionGradeId, BudgetConstraint, PrimaryPriority, UrgencyLevel } from '../types';

export type OutcomeType = 'repair' | 'reuse' | 'repurpose' | 'replace' | 'recycle';

export type OutcomeViability = 'recommended' | 'viable' | 'alternative' | 'unfavorable' | 'hazardous';

export interface ScoreBreakdown {
  safety: number; // 0 - 100
  feasibility: number; // 0 - 100
  economicViability: number | null; // 0 - 100 or null if costs unknown
  circularImpact: number; // 0 - 100
  userAlignment: number; // 0 - 100
}

export interface CircularActionPlan {
  id: string;
  title: string;
  headline: string;
  rationale: string;
  confidenceScore: number;
  confidenceLevel?: 'High' | 'Moderate' | 'Limited (Data Gaps)';
  wasteSavedEstimate: string;
  costEfficiency: string;
  feasibility: 'High (DIY / Low skill)' | 'Moderate (Local tech)' | 'Specialist Required';
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  co2SavingsEstimate: string;
  recommendedSteps: string[];
}

export interface OutcomeSubBranch {
  id: string;
  outcomeType: OutcomeType;
  title: string;
  shortLabel: string;
  description: string;
  viability: OutcomeViability;
  conditionCriteria: string;
  actionPlan: CircularActionPlan;
  isSelected?: boolean;
}

export interface CircularOutcomeSector {
  outcomeType: OutcomeType;
  title: string;
  angleDegrees: number; // Radial angle in degrees (e.g. -90, -18, 54, 126, 198)
  iconName: string;
  bannerBg: string;
  borderColor: string;
  viability: OutcomeViability;
  fitPercentage: number; // 0 - 100
  summary: string;
  keyDrivers: string[];
  comparativeRationale?: string;
  scoreBreakdown?: ScoreBreakdown;
  dataLimitations?: string[];
  subBranches: OutcomeSubBranch[];
}

export interface EvaluatedCircularTree {
  product: {
    name: string;
    category: ItemCategoryId;
    condition: ConditionGradeId | null;
    brandModel?: string;
    reportedFault: string;
    repairCost?: number | null;
    replacementCost?: number | null;
    budget?: BudgetConstraint | null;
    priority?: PrimaryPriority | null;
    urgency?: UrgencyLevel | null;
  };
  recommendedOutcome: OutcomeType;
  rankingOrder: OutcomeType[];
  primaryVerdictRationale: string;
  overallDataLimitations: string[];
  outcomes: Record<OutcomeType, CircularOutcomeSector>;
  activeBranchId: string | null;
  inspectedNodeId: string | null;
}
