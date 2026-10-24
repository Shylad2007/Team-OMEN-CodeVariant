import {
  evaluateCircularDecisionTree,
  detectHazard,
  detectHazardDetails,
  isDirectReuseEligible,
} from '../components/assessment/circular/circularTreeData';
import { buildCircularGraphElements } from '../components/assessment/circular/radialLayout';
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

// Test 9: Broken Non-Functional items NEVER recommend direct Reuse without repair
const brokenOfficeChair: AssessmentData = {
  itemName: 'Ergonomic Office Chair',
  category: 'furniture',
  age: '1_to_3_years',
  condition: 'broken_non_functional',
  reportedFault: 'Hydraulic lift cylinder failed completely, chair sinks to the floor',
  repairCost: 1200,
  repairCostUnknown: false,
  replacementCost: 14000,
  replacementCostUnknown: false,
  expectedLifespanYears: 5,
  expectedLifespanUnknown: false,
  budgetConstraint: 'minimal',
  urgency: 'urgent',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};

const brokenChairResult = evaluateCircularDecisionTree(brokenOfficeChair);
assert(brokenChairResult.recommendedOutcome !== 'reuse', 'Broken non-functional item must NEVER recommend direct reuse');
assert(brokenChairResult.recommendedOutcome === 'repair', 'Repair must rank #1 for broken chair with 8.5% repair cost ratio');
assert(brokenChairResult.outcomes.reuse.viability === 'unfavorable', 'Reuse viability must be unfavorable for broken item');
assert(brokenChairResult.outcomes.reuse.fitPercentage <= 15, 'Reuse fit score must be hard-gated at <= 15%');
assert(
  brokenChairResult.outcomes.reuse.comparativeRationale.includes('Disqualified') ||
  brokenChairResult.outcomes.reuse.comparativeRationale.includes('non-functional'),
  'Reuse comparative rationale must explain disqualification'
);
console.log('✓ Test 9 Passed: Hard gate bars broken non-functional items from recommending direct Reuse');

// Test 10: Severe Structural Failure NEVER recommends direct Reuse
const shatteredFrame: AssessmentData = {
  itemName: 'Hardwood Bookshelf',
  category: 'furniture',
  age: 'over_10_years',
  condition: 'severe_structural_failure',
  reportedFault: 'Main upright side panel snapped in half during house move',
  repairCost: 4500,
  repairCostUnknown: false,
  replacementCost: 5000,
  replacementCostUnknown: false,
  expectedLifespanYears: 1,
  expectedLifespanUnknown: false,
  budgetConstraint: 'minimal',
  urgency: 'flexible',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};

const shatteredResult = evaluateCircularDecisionTree(shatteredFrame);
assert(shatteredResult.recommendedOutcome !== 'reuse', 'Severe structural failure must NEVER recommend reuse');
assert(shatteredResult.outcomes.reuse.fitPercentage <= 15, 'Severe failure reuse score must be <= 15%');
console.log('✓ Test 10 Passed: Severe structural failure strictly bars direct Reuse');

// Test 11: False-Positive Hazard Elimination (Burner, Spark Plug, Sparkling, Battery Capacity)
const gasCooktop: AssessmentData = {
  itemName: 'Gas Cooktop 4-Burner',
  category: 'appliances',
  age: '3_to_5_years',
  condition: 'partially_functional',
  reportedFault: 'Left gas burner is clogged with grease and hard to light',
  repairCost: 800,
  repairCostUnknown: false,
  replacementCost: 15000,
  replacementCostUnknown: false,
  expectedLifespanYears: 6,
  expectedLifespanUnknown: false,
  budgetConstraint: 'moderate',
  urgency: 'moderate',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};
assert(!detectHazard(gasCooktop), 'Gas stove burner must not trigger hazard false alarm');
const gasResult = evaluateCircularDecisionTree(gasCooktop);
assert(gasResult.recommendedOutcome === 'repair', 'Gas burner clean/tune must recommend repair');
assert(!gasResult.primaryVerdictRationale.includes('CRITICAL SAFETY ALERT'), 'No false safety alert for burner');

const lawnMower: AssessmentData = {
  itemName: 'Rotary Lawn Mower',
  category: 'tools',
  age: '3_to_5_years',
  condition: 'partially_functional',
  reportedFault: 'Engine sputters; fouled spark plug needs cleaning or replacement',
  repairCost: 400,
  repairCostUnknown: false,
  replacementCost: 12000,
  replacementCostUnknown: false,
  expectedLifespanYears: 4,
  expectedLifespanUnknown: false,
  budgetConstraint: 'minimal',
  urgency: 'flexible',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};
assert(!detectHazard(lawnMower), 'Spark plug must not trigger hazard false alarm');
const mowerResult = evaluateCircularDecisionTree(lawnMower);
assert(mowerResult.recommendedOutcome === 'repair', 'Lawn mower spark plug swap must recommend repair');

const chandelier: AssessmentData = {
  itemName: 'Sparkling Crystal Chandelier',
  category: 'furniture',
  age: '1_to_3_years',
  condition: 'mint_minor_issue',
  reportedFault: 'One crystal pendant fell off hook',
  repairCost: 200,
  repairCostUnknown: false,
  replacementCost: 18000,
  repairCostUnknown: false,
  replacementCostUnknown: false,
  expectedLifespanYears: 10,
  expectedLifespanUnknown: false,
  budgetConstraint: 'flexible',
  urgency: 'flexible',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};
assert(!detectHazard(chandelier), 'Sparkling item must not trigger hazard false alarm');

const cordlessDrillOldBattery: AssessmentData = {
  itemName: 'Cordless Drill 18V',
  category: 'tools',
  age: '3_to_5_years',
  condition: 'partially_functional',
  reportedFault: 'Battery pack runtime is short, lasts only 15 minutes',
  repairCost: 1500,
  repairCostUnknown: false,
  replacementCost: 7000,
  replacementCostUnknown: false,
  expectedLifespanYears: 3,
  expectedLifespanUnknown: false,
  budgetConstraint: 'moderate',
  urgency: 'moderate',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};
assert(!detectHazard(cordlessDrillOldBattery), 'Routine battery runtime wear must not trigger hazard false alarm');
console.log('✓ Test 11 Passed: False-positive hazard elimination verified across burners, spark plugs, sparkling, and batteries');

// Test 12: Genuine Hazard Detection (Swelling, Arcing, Chemical Leak)
const electricalArcMicrowave: AssessmentData = {
  itemName: 'Countertop Microwave',
  category: 'appliances',
  age: '5_to_10_years',
  condition: 'broken_non_functional',
  reportedFault: 'Violent electrical arcing and sparks from magnetron waveguide with burning smell',
  repairCost: null,
  repairCostUnknown: true,
  replacementCost: 6000,
  replacementCostUnknown: false,
  expectedLifespanYears: null,
  expectedLifespanUnknown: true,
  budgetConstraint: 'moderate',
  urgency: 'urgent',
  primaryPriority: 'reduce_waste',
  adaptiveAnswers: {},
};
assert(detectHazard(electricalArcMicrowave), 'Violent arcing with burning smell must be detected as hazard');
const arcResult = evaluateCircularDecisionTree(electricalArcMicrowave);
assert(arcResult.recommendedOutcome === 'recycle', 'Hazardous microwave must mandate certified recycling');
assert(arcResult.outcomes.repair.viability === 'hazardous', 'Repair must be marked hazardous');
assert(arcResult.outcomes.reuse.viability === 'hazardous', 'Reuse must be marked hazardous');

const freonLeakAC: AssessmentData = {
  itemName: 'Split Air Conditioner',
  category: 'appliances',
  age: '5_to_10_years',
  condition: 'broken_non_functional',
  reportedFault: 'Punctured coil causing active chemical refrigerant leak',
  repairCost: null,
  repairCostUnknown: true,
  replacementCost: 35000,
  replacementCostUnknown: false,
  expectedLifespanYears: null,
  expectedLifespanUnknown: true,
  budgetConstraint: 'flexible',
  urgency: 'urgent',
  primaryPriority: 'reduce_waste',
  adaptiveAnswers: {},
};
assert(detectHazard(freonLeakAC), 'Refrigerant leak must trigger safety hazard');
const acResult = evaluateCircularDecisionTree(freonLeakAC);
assert(acResult.recommendedOutcome === 'recycle', 'Chemical refrigerant leak mandates certified recycling');
console.log('✓ Test 12 Passed: Authentic safety hazards trigger non-negotiable safe recycling gate');

// Test 13: Repurpose Recommended for Unrepairable Item with Maker Waste Reduction Priority
const brokenTeakCabinet: AssessmentData = {
  itemName: 'Hardwood Audio Cabinet',
  category: 'furniture',
  age: 'over_10_years',
  condition: 'severe_structural_failure',
  reportedFault: 'Cracked outer veneer and shattered back frame, electronics obsolete, but solid timber slabs intact',
  repairCost: 12000,
  repairCostUnknown: false,
  replacementCost: 13000,
  replacementCostUnknown: false,
  expectedLifespanYears: 1,
  expectedLifespanUnknown: false,
  budgetConstraint: 'minimal',
  urgency: 'flexible',
  primaryPriority: 'reduce_waste',
  adaptiveAnswers: {},
};
const cabinetResult = evaluateCircularDecisionTree(brokenTeakCabinet);
assert(cabinetResult.recommendedOutcome === 'repurpose', 'Repurpose should rank #1 when repair is uneconomical and user prioritizes waste reduction on salvageable material');
assert(cabinetResult.outcomes.repurpose.fitPercentage > cabinetResult.outcomes.repair.fitPercentage, 'Repurpose must outrank repair for uneconomical structural furniture damage');
console.log('✓ Test 13 Passed: Repurpose successfully ranks #1 for maker upcycling when repair is unviable');

// Test 14: Replace Recommended for Inefficient Severe Appliance Failure
const legacyFridge: AssessmentData = {
  itemName: 'Double Door Refrigerator',
  category: 'appliances',
  age: 'over_10_years',
  condition: 'severe_structural_failure',
  reportedFault: 'Seized compressor and rusted chassis frame',
  repairCost: 19000,
  repairCostUnknown: false,
  replacementCost: 22000,
  replacementCostUnknown: false,
  expectedLifespanYears: 1,
  expectedLifespanUnknown: false,
  budgetConstraint: 'flexible',
  urgency: 'urgent',
  primaryPriority: 'convenience',
  adaptiveAnswers: {},
};
const fridgeResult = evaluateCircularDecisionTree(legacyFridge);
assert(fridgeResult.recommendedOutcome === 'replace', 'Replace must rank #1 for 10+ year old appliance with seized compressor and 86% repair cost');
assert(fridgeResult.outcomes.replace.fitPercentage >= 80, 'Replace fit score must be >= 80%');
console.log('✓ Test 14 Passed: Replace ranks #1 for legacy severe structural failure with high repair cost');

// Test 15: Direct Reuse Recommended for Operational Item with Minor Wear
const operationalMonitor: AssessmentData = {
  itemName: '27-inch Dell IPS Monitor',
  category: 'electronics',
  age: '1_to_3_years',
  condition: 'mint_minor_issue',
  reportedFault: 'Minor scratches on stand base; screen and panel are 100% flawless',
  repairCost: null,
  repairCostUnknown: true,
  replacementCost: 18000,
  replacementCostUnknown: false,
  expectedLifespanYears: 6,
  expectedLifespanUnknown: false,
  budgetConstraint: 'minimal',
  urgency: 'flexible',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};
const monitorResult = evaluateCircularDecisionTree(operationalMonitor);
assert(monitorResult.recommendedOutcome === 'reuse', 'Mint condition item must recommend direct reuse');
assert(monitorResult.outcomes.reuse.fitPercentage >= 85, 'Direct reuse fit must be >= 85% for mint item');
assert(monitorResult.outcomes.replace.fitPercentage <= 45, 'Replace fit must be suppressed for operational hardware');
console.log('✓ Test 15 Passed: Direct Reuse ranks #1 for mint hardware without unnecessary repair/replacement');

// Test 16: Deterministic Repeatability — 10 Consecutive Runs Yield Strictly Identical Outputs
const baselineSample: AssessmentData = {
  itemName: 'Bose SoundLink Speaker',
  category: 'electronics',
  age: '1_to_3_years',
  condition: 'partially_functional',
  reportedFault: 'Aux jack is loose; Bluetooth audio functions normally',
  repairCost: 800,
  repairCostUnknown: false,
  replacementCost: 11000,
  replacementCostUnknown: false,
  expectedLifespanYears: 4,
  expectedLifespanUnknown: false,
  budgetConstraint: 'moderate',
  urgency: 'moderate',
  primaryPriority: 'extend_lifespan',
  adaptiveAnswers: {},
};
const initialRun = evaluateCircularDecisionTree(baselineSample);
for (let i = 0; i < 10; i++) {
  const repeatedRun = evaluateCircularDecisionTree(baselineSample);
  assert(repeatedRun.recommendedOutcome === initialRun.recommendedOutcome, `Run ${i + 1}: recommendedOutcome mismatch`);
  assert(
    JSON.stringify(repeatedRun.rankingOrder) === JSON.stringify(initialRun.rankingOrder),
    `Run ${i + 1}: rankingOrder mismatch`
  );
  assert(
    repeatedRun.primaryVerdictRationale === initialRun.primaryVerdictRationale,
    `Run ${i + 1}: primaryVerdictRationale mismatch`
  );
  for (const outcome of ['repair', 'reuse', 'repurpose', 'replace', 'recycle'] as const) {
    assert(
      repeatedRun.outcomes[outcome].fitPercentage === initialRun.outcomes[outcome].fitPercentage,
      `Run ${i + 1}: fit score mismatch on ${outcome}`
    );
  }
}
console.log('✓ Test 16 Passed: 100% deterministic repeatability verified across 10 identical evaluations');

// Test 17: Deterministic Circular Hierarchy Tie-Breaker
assert(isDirectReuseEligible('mint_minor_issue'), 'mint_minor_issue must be eligible for direct reuse');
assert(!isDirectReuseEligible('broken_non_functional'), 'broken_non_functional must NOT be eligible for direct reuse');
assert(!isDirectReuseEligible('severe_structural_failure'), 'severe_structural_failure must NOT be eligible for direct reuse');
console.log('✓ Test 17 Passed: Deterministic circular hierarchy eligibility rules verified');

// Test 18: Radial Graph Synchronization and Alternative Path Selection
const graphSample: AssessmentData = {
  itemName: 'MacBook Air M1',
  category: 'electronics',
  age: '1_to_3_years',
  condition: 'partially_functional',
  reportedFault: 'Trackpad haptic click is intermittent; keyboard works perfectly',
  repairCost: 2500,
  repairCostUnknown: false,
  replacementCost: 65000,
  replacementCostUnknown: false,
  expectedLifespanYears: 5,
  expectedLifespanUnknown: false,
  budgetConstraint: 'moderate',
  urgency: 'moderate',
  primaryPriority: 'save_money',
  adaptiveAnswers: {},
};
const graphTree = evaluateCircularDecisionTree(graphSample);
assert(graphTree.recommendedOutcome === 'repair', 'MacBook Air with minor trackpad issue must recommend repair');

// Build default graph (activeBranchId is null -> defaults to recommended outcome)
const defaultGraph = buildCircularGraphElements(graphTree, null);
const centerNode = defaultGraph.nodes.find(n => n.id === 'product_center');
assert(centerNode !== undefined, 'Central product node must exist');
assert((centerNode?.data as any).recommendedOutcome === 'repair', 'Center node must reflect engine recommendation');

// Edge from center to repair outcome must be animated by default
const centerToRepairEdge = defaultGraph.edges.find(e => e.id === 'edge_center_to_repair');
assert(centerToRepairEdge?.animated === true, 'Center to repair edge must be animated by default');
assert(centerToRepairEdge?.label?.includes('BEST FIT'), 'Center to repair edge must be labeled BEST FIT');

// Switch active branch to an alternative (e.g. reuse branch)
const alternativeBranchId = graphTree.outcomes.reuse.subBranches[0]?.id;
assert(Boolean(alternativeBranchId), 'Reuse sub-branch must exist');

const switchedGraph = buildCircularGraphElements(graphTree, alternativeBranchId);
const switchedCenterToRepairEdge = switchedGraph.edges.find(e => e.id === 'edge_center_to_repair');
const switchedCenterToReuseEdge = switchedGraph.edges.find(e => e.id === 'edge_center_to_reuse');

assert(switchedCenterToRepairEdge?.animated === false, 'Repair edge should no longer be animated when reuse branch is active');
assert(switchedCenterToReuseEdge?.animated === true, 'Reuse edge must become animated when reuse branch is active');
assert(switchedCenterToReuseEdge?.label?.includes('ACTIVE'), 'Active reuse edge must have ACTIVE label');

// Engine recommended outcome on the outcome node must still be isRecommended: true for repair and false for reuse
const repairOutcomeNode = switchedGraph.nodes.find(n => n.id === 'outcome_repair');
const reuseOutcomeNode = switchedGraph.nodes.find(n => n.id === 'outcome_reuse');
assert((repairOutcomeNode?.data as any).isRecommended === true, 'Repair outcome node must retain isRecommended = true');
assert((repairOutcomeNode?.data as any).isActive === false, 'Repair outcome node isActive must be false');
assert((reuseOutcomeNode?.data as any).isRecommended === false, 'Reuse outcome node isRecommended must be false');
assert((reuseOutcomeNode?.data as any).isActive === true, 'Reuse outcome node isActive must be true');

console.log('✓ Test 18 Passed: Radial graph synchronization dynamically animates active paths while preserving engine recommendation');

console.log('\n======================================================');
console.log('ALL 18 DECISION INTELLIGENCE, ELIGIBILITY, AND GRAPH TESTS PASSED!');
console.log('======================================================');
