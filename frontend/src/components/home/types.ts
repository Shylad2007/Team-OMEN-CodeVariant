export interface ItemProfile {
  id: string;
  name: string;
  category: string;
  year: number;
  condition: string;
  symptom: string;
  partsAvailability: 'Abundant' | 'Moderate' | 'Scarce';
  repairCost: number;
  replaceCost: number;
  bestOutcome: 'REPAIR' | 'REUSE' | 'REPURPOSE' | 'REPLACE' | 'RECYCLE';
  viabilityScore: number;
  rationale: string;
  firstStep: string;
}

export interface OutcomeData {
  id: string;
  name: string;
  tagColor: string;
  borderColor: string;
  badge: string;
  summary: string;
  criteria: string;
  examples: string;
  nextStep: string;
}
