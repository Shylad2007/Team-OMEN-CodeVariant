import { evaluateCircularDecisionTree } from '../components/assessment/circular/circularTreeData';
import type { AssessmentData } from '../components/assessment/types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- RUNNING DECISION INTELLIGENCE TEST SUITE ---');

// Test 1: Hazardous battery failure
const hazardItem: AssessmentData = {
  itemName: 'Old Smartphone',
  category: 'electronics',
  age: '3_to_5_years',
  condition: 'broken_non_functional',
  reportedFault: 'Battery is severely swollen and pushed screen out with burning smell',
  repairCost: null,
  repairCostUnknown: true,
  replacementCost: null,
  replacementCostUnknown: true,
  expectedLifespanYears: null,
  expectedLifespanUnknown: true,
  budgetConstraint: 'moderate',
  urgency: 'urgent',
  primaryPriority: 'reduce_waste',
  adaptiveAnswers: {},
};

const hazardResult = evaluateCircularDecisionTree(hazardItem);
assert(hazardResult.recommendedOutcome === 'recycle', 'Hazardous item must recommend recycle');
assert(hazardResult.outcomes.repair.viability === 'hazardous', 'Repair must be flagged hazardous for swollen battery');
assert(hazardResult.outcomes.recycle.fitPercentage >= 95, 'Recycle fit must be >= 95%');
console.log('✓ Test 1 Passed: Hazardous battery triggers critical safe recycling');

// Test 2: Mint condition with minor wear
const mintItem: AssessmentData = {
  itemName: 'Vintage Solid Teak Chair',
  category: 'furniture',
  age: '5_to_10_years',
  condition: 'mint_minor_issue',
  reportedFault: 'One joint has slightly loose mortise and wobbles',
  repairCost: 500,
  repairCostUnknown: false,
  replacementCost: 15000,
  replacementCostUnknown: false,
  expectedLifespanYears: 10,
  expectedLifespanUnknown: false,
  budgetConstraint: 'flexible',
  urgency: 'flexible',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};

const mintResult = evaluateCircularDecisionTree(mintItem);
assert(mintResult.recommendedOutcome === 'repair' || mintResult.recommendedOutcome === 'reuse', 'Mint item should recommend repair or reuse');
assert(mintResult.outcomes.replace.fitPercentage < 60, 'Replace should rank low for mint solid wood piece');
assert(mintResult.outcomes.repair.subBranches.some(b => b.title.includes('Joint')), 'Must generate furniture-specific joint sub-branches');
console.log('✓ Test 2 Passed: Mint furniture prioritizes repair/reuse with category sub-branches');

// Test 3: Severe structural failure with uneconomical repair quote
const brokenItem: AssessmentData = {
  itemName: 'Washing Machine',
  category: 'appliances',
  age: 'over_10_years',
  condition: 'severe_structural_failure',
  reportedFault: 'Cracked drum casing and burnt out motor',
  repairCost: 22000,
  repairCostUnknown: false,
  replacementCost: 24000,
  replacementCostUnknown: false,
  expectedLifespanYears: 1,
  expectedLifespanUnknown: false,
  budgetConstraint: 'flexible',
  urgency: 'urgent',
  primaryPriority: 'convenience',
  adaptiveAnswers: {},
};

const brokenResult = evaluateCircularDecisionTree(brokenItem);
assert(brokenResult.recommendedOutcome !== 'repair', 'Repair must not be recommended when repair quote is 92% of new replacement on severe failure');
assert(brokenResult.outcomes.repair.fitPercentage < 50, 'Repair fit must be unfavorable for severe structural damage + high cost');
console.log('✓ Test 3 Passed: Severe structural appliance failure penalizes repair');

// Test 4: Missing optional inputs (costs and lifespan unknown)
const incompleteData: AssessmentData = {
  itemName: 'Cordless Drill',
  category: 'tools',
  age: null,
  condition: 'partially_functional',
  reportedFault: 'Intermittent sparking from motor housing',
  repairCost: null,
  repairCostUnknown: true,
  replacementCost: null,
  replacementCostUnknown: true,
  expectedLifespanYears: null,
  expectedLifespanUnknown: true,
  budgetConstraint: null,
  urgency: null,
  primaryPriority: null,
  adaptiveAnswers: {},
};

const incompleteResult = evaluateCircularDecisionTree(incompleteData);
assert(incompleteResult.overallDataLimitations.length >= 2, 'Must record data limitations when costs are unspecified');
assert(incompleteResult.outcomes.repair.scoreBreakdown?.economicViability === null, 'Economic viability must be null when costs are unknown');
assert(incompleteResult.outcomes.repair.subBranches[0].actionPlan.costEfficiency.includes('unverified'), 'Action plan must acknowledge unverified cost efficiency');
console.log('✓ Test 4 Passed: Missing costs handled honestly with data limitation notices');

// Test 5: Clothing category verification
const jacketItem: AssessmentData = {
  itemName: 'Winter Wool Coat',
  category: 'clothing',
  age: '1_to_3_years',
  condition: 'partially_functional',
  reportedFault: 'Seam separation at left armpit and two missing horn buttons',
  repairCost: 300,
  repairCostUnknown: false,
  replacementCost: 6500,
  replacementCostUnknown: false,
  expectedLifespanYears: 5,
  expectedLifespanUnknown: false,
  budgetConstraint: 'minimal',
  urgency: 'flexible',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};

const jacketResult = evaluateCircularDecisionTree(jacketItem);
assert(jacketResult.recommendedOutcome === 'repair', 'Inexpensive repair on winter coat must rank #1');
assert(jacketResult.outcomes.repair.subBranches.some(b => b.title.includes('Mending')), 'Must have textile mending sub-branches');
assert(jacketResult.rankingOrder[0] === 'repair', 'Ranking order must reflect repair as #1');
console.log('✓ Test 5 Passed: Clothing repair ranked #1 with mending sub-branches');

// Test 6: Comparator Economic Calculations & Trade-off Logic
const compItem: AssessmentData = {
  itemName: 'Espresso Machine',
  category: 'appliances',
  age: '3_to_5_years',
  condition: 'partially_functional',
  reportedFault: 'Leaking brew valve',
  repairCost: 1500,
  repairCostUnknown: false,
  replacementCost: 12000,
  replacementCostUnknown: false,
  expectedLifespanYears: 4,
  expectedLifespanUnknown: false,
  budgetConstraint: 'moderate',
  urgency: 'moderate',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};

const compResult = evaluateCircularDecisionTree(compItem);
const repairScore = compResult.outcomes.repair.scoreBreakdown?.economicViability;
const replaceScore = compResult.outcomes.replace.scoreBreakdown?.economicViability;
assert(typeof repairScore === 'number' && repairScore >= 80, 'Low salvage ratio (12.5%) must yield high economic viability for repair');
assert(typeof replaceScore === 'number' && replaceScore <= 50, 'Replace score should be low when repair is only 12.5% of new replacement');
assert(compResult.recommendedOutcome === 'repair', 'Cost-effective appliance repair must be recommended');
console.log('✓ Test 6 Passed: Comparator economic calculations correctly weight repair vs replace');

// Test 7: Comparator Extreme Uneconomical Repair (Repair quote exceeds replacement)
const uneconomicalItem: AssessmentData = {
  itemName: 'Basic Kettle',
  category: 'appliances',
  age: '5_to_10_years',
  condition: 'severe_structural_failure',
  reportedFault: 'Burnt heating element and melted base',
  repairCost: 1800,
  repairCostUnknown: false,
  replacementCost: 1200,
  replacementCostUnknown: false,
  expectedLifespanYears: 1,
  expectedLifespanUnknown: false,
  budgetConstraint: 'minimal',
  urgency: 'urgent',
  primaryPriority: 'convenience',
  adaptiveAnswers: {},
};

const uneconResult = evaluateCircularDecisionTree(uneconomicalItem);
assert(uneconResult.outcomes.repair.scoreBreakdown?.economicViability === 25, 'Uneconomical repair must receive lowest economic score (25)');
assert(uneconResult.outcomes.replace.scoreBreakdown?.economicViability === 95, 'Replace must receive highest economic score when repair exceeds 85% of replacement');
assert(uneconResult.recommendedOutcome !== 'repair', 'Repair must not be recommended when repair cost exceeds replacement outlay');
console.log('✓ Test 7 Passed: Uneconomical repair flips priority to replacement/recycling');

// Test 8: Comparator Unknowns Transparency
const unknownItem: AssessmentData = {
  itemName: 'Vintage Clock',
  category: 'other',
  age: 'over_10_years',
  condition: 'mint_minor_issue',
  reportedFault: 'Pendulum stopped',
  repairCost: null,
  repairCostUnknown: true,
  replacementCost: null,
  replacementCostUnknown: true,
  expectedLifespanYears: null,
  expectedLifespanUnknown: true,
  budgetConstraint: null,
  urgency: null,
  primaryPriority: null,
  adaptiveAnswers: {},
};

const unknownResult = evaluateCircularDecisionTree(unknownItem);
assert(unknownResult.outcomes.repair.scoreBreakdown?.economicViability === null, 'Unknown economic score must be null without fabricating values');
assert(unknownResult.overallDataLimitations.length >= 2, 'Overall data limitations must record unspecified costs');
console.log('✓ Test 8 Passed: Comparator unknown costs strictly preserved as null with honest data gap notice');

console.log('ALL 8 DECISION INTELLIGENCE & COMPARATOR TEST SCENARIOS PASSED!');
