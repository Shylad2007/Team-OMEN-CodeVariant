import React, { useState, useMemo } from 'react';
import {
  Wrench,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Award,
  AlertCircle,
} from 'lucide-react';
import type { AssessmentData } from '../types';
import type { EvaluatedCircularTree, OutcomeType } from '../circular/circularTreeTypes';

interface RepairReplaceComparatorProps {
  data: AssessmentData;
  tree: EvaluatedCircularTree;
  selectedOutcome: string | null;
  onSelectOutcome: (outcome: OutcomeType) => void;
  onProceedToActionPlan: () => void;
}

export const RepairReplaceComparator: React.FC<RepairReplaceComparatorProps> = ({
  data,
  tree,
  selectedOutcome,
  onSelectOutcome,
  onProceedToActionPlan,
}) => {
  const repairSector = tree.outcomes.repair;
  const replaceSector = tree.outcomes.replace;

  // Real assessment cost states
  const hasKnownRepairCost = typeof data.repairCost === 'number' && !data.repairCostUnknown && data.repairCost > 0;
  const hasKnownReplaceCost = typeof data.replacementCost === 'number' && !data.replacementCostUnknown && data.replacementCost > 0;
  const hasKnownLifespan = typeof data.expectedLifespanYears === 'number' && !data.expectedLifespanUnknown && data.expectedLifespanYears > 0;

  // Default simulation values initialized with real data if available, or sensible category defaults
  const defaultSimRepair = hasKnownRepairCost ? (data.repairCost as number) : 1200;
  const defaultSimReplace = hasKnownReplaceCost ? (data.replacementCost as number) : 6000;
  const defaultSimLifespan = hasKnownLifespan ? (data.expectedLifespanYears as number) : 3;

  // What-If Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simRepairCost, setSimRepairCost] = useState<number>(defaultSimRepair);
  const [simReplaceCost, setSimReplaceCost] = useState<number>(defaultSimReplace);
  const [simLifespanYears, setSimLifespanYears] = useState<number>(defaultSimLifespan);

  // Active numbers used for calculations (simulation vs real)
  const activeRepairCost = isSimulating ? simRepairCost : (hasKnownRepairCost ? (data.repairCost as number) : null);
  const activeReplaceCost = isSimulating ? simReplaceCost : (hasKnownReplaceCost ? (data.replacementCost as number) : null);
  const activeLifespan = isSimulating ? simLifespanYears : (hasKnownLifespan ? (data.expectedLifespanYears as number) : null);

  // Calculations
  const calculations = useMemo(() => {
    if (activeRepairCost === null || activeReplaceCost === null) {
      return null;
    }

    const netSavings = activeReplaceCost - activeRepairCost;
    const savingsPercent = Math.round((netSavings / Math.max(1, activeReplaceCost)) * 100);
    const salvageRatio = Math.round((activeRepairCost / Math.max(1, activeReplaceCost)) * 100);

    const annualizedRepair = activeLifespan ? Math.round(activeRepairCost / Math.max(1, activeLifespan)) : null;
    // Typical new item baseline lifespan estimated at 6 years
    const annualizedReplace = Math.round(activeReplaceCost / 6);

    let economicVerdict: 'favors_repair' | 'marginal' | 'favors_replace';
    if (salvageRatio <= 40) {
      economicVerdict = 'favors_repair';
    } else if (salvageRatio <= 70) {
      economicVerdict = 'marginal';
    } else {
      economicVerdict = 'favors_replace';
    }

    return {
      netSavings,
      savingsPercent,
      salvageRatio,
      annualizedRepair,
      annualizedReplace,
      economicVerdict,
    };
  }, [activeRepairCost, activeReplaceCost, activeLifespan]);

  const isHazardous = repairSector.viability === 'hazardous';
  const isRepairRecommended = tree.recommendedOutcome === 'repair';
  const isReplaceRecommended = tree.recommendedOutcome === 'replace';

  const handleResetSimulation = () => {
    setSimRepairCost(defaultSimRepair);
    setSimReplaceCost(defaultSimReplace);
    setSimLifespanYears(defaultSimLifespan);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      {/* Hazard Interception Banner */}
      {isHazardous && (
        <div className="p-4 bg-[#FFF5F5] border-3 border-[#DC2626] font-mono text-xs flex items-start gap-3 shadow-[4px_4px_0px_#DC2626]">
          <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-none mt-0.5" />
          <div className="space-y-1">
            <strong className="text-[#DC2626] block text-sm">
              CRITICAL HAZARD DETECTED: SAFETY SUPERSEDES ECONOMIC COMPARATOR
            </strong>
            <p className="font-sans text-xs text-[#262422] leading-relaxed">
              Your assessment reported battery swelling, smoke, burning odors, or severe thermal malfunction.
              Regardless of economic cost ratios, DIY or standard workshop repair is classified as hazardous.
              Certified e-waste recycling or authorized manufacturer battery depot service is non-negotiable.
            </p>
          </div>
        </div>
      )}

      {/* Main Comparative Header Banner */}
      <div className="p-5 sm:p-6 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#0B0B0B]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 bg-[#FFE600] border border-[#0B0B0B]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6C6659]">
                R3VIVE Financial & Circular Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#0B0B0B]">
              Repair vs. Replace Comparator
            </h1>
            <p className="font-mono text-xs text-[#544E43] mt-1">
              Evaluating trade-offs for: <strong className="text-[#0B0B0B]">{data.itemName}</strong> ({data.category?.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSimulating(!isSimulating);
                if (!isSimulating) {
                  setSimRepairCost(defaultSimRepair);
                  setSimReplaceCost(defaultSimReplace);
                  setSimLifespanYears(defaultSimLifespan);
                }
              }}
              className={`px-3 py-2 border-2 border-[#0B0B0B] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#0B0B0B] transition-all ${
                isSimulating ? 'bg-[#2A5BFF] text-white' : 'bg-[#FFFDF5] hover:bg-[#FFE600] text-[#0B0B0B]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Active: What-If Simulator' : 'Simulate Custom Quotes'}</span>
            </button>
          </div>
        </div>

        {/* Missing Cost Notice (When applicable and not simulating) */}
        {!isSimulating && (!hasKnownRepairCost || !hasKnownReplaceCost) && (
          <div className="mt-4 p-3 bg-[#FFFBEB] border-2 border-[#D97706] font-mono text-xs text-[#B45309] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-none mt-0.5" />
            <div>
              <strong>Truthful Data Limitation: </strong>
              {!hasKnownRepairCost && !hasKnownReplaceCost
                ? 'Neither repair quote nor replacement cost was supplied during assessment. R3VIVE strictly avoids fabricating estimates. You can use the "Simulate Custom Quotes" button above to test hypothetical scenarios.'
                : !hasKnownRepairCost
                ? 'Repair quote was not supplied. Upfront break-even ratio cannot be verified until a technician quote is obtained.'
                : 'Replacement price was not supplied. Comparison reflects known repair costs only.'}
            </div>
          </div>
        )}

        {/* What-If Simulator Drawer (Toggleable) */}
        {isSimulating && (
          <div className="mt-5 p-4 bg-[#F4EFE2] border-2 border-[#0B0B0B] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#0B0B0B]/20">
              <span className="font-mono text-xs font-bold text-[#0B0B0B] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#2A5BFF]" />
                WHAT-IF SCENARIO SIMULATOR (DOES NOT OVERWRITE ASSESSED RECORDS)
              </span>
              <button
                type="button"
                onClick={handleResetSimulation}
                className="font-mono text-[11px] text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Assessed Values</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold">Simulated Repair Quote:</span>
                  <span className="font-black bg-[#FFE600] px-1.5 border border-[#0B0B0B]">
                    ₹{simRepairCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="25000"
                  step="100"
                  value={simRepairCost}
                  onChange={(e) => setSimRepairCost(Number(e.target.value))}
                  className="w-full accent-[#0B0B0B] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold">Simulated New Replacement:</span>
                  <span className="font-black bg-white px-1.5 border border-[#0B0B0B]">
                    ₹{simReplaceCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="60000"
                  step="500"
                  value={simReplaceCost}
                  onChange={(e) => setSimReplaceCost(Number(e.target.value))}
                  className="w-full accent-[#0B0B0B] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold">Simulated Added Life:</span>
                  <span className="font-black bg-[#2A5BFF] text-white px-1.5 border border-[#0B0B0B]">
                    {simLifespanYears} {simLifespanYears === 1 ? 'Year' : 'Years'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={simLifespanYears}
                  onChange={(e) => setSimLifespanYears(Number(e.target.value))}
                  className="w-full accent-[#0B0B0B] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculated High-Level Decision Metric Cards (When economics available) */}
      {calculations && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Capital Conservation */}
          <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]">
            <span className="font-mono text-[10px] text-[#6C6659] uppercase font-bold block mb-1">
              CAPITAL RETAINED BY REPAIRING
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black font-display ${calculations.netSavings >= 0 ? 'text-[#10B25A]' : 'text-[#DC2626]'}`}>
                {calculations.netSavings >= 0 ? `+₹${calculations.netSavings.toLocaleString('en-IN')}` : `-₹${Math.abs(calculations.netSavings).toLocaleString('en-IN')}`}
              </span>
              <span className="font-mono text-xs font-bold text-[#6C6659]">
                ({calculations.savingsPercent}% {calculations.netSavings >= 0 ? 'saved' : 'deficit'})
              </span>
            </div>
            <p className="font-mono text-[10.5px] text-[#544E43] mt-2 border-t border-[#0B0B0B]/10 pt-1.5">
              {calculations.netSavings >= 0
                ? 'Direct capital preserved in your bank account versus purchasing new.'
                : 'Repair quote exceeds standard new unit replacement outlay.'}
            </p>
          </div>

          {/* Salvage Ratio / Economic Burden */}
          <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]">
            <span className="font-mono text-[10px] text-[#6C6659] uppercase font-bold block mb-1">
              REPAIR-TO-REPLACEMENT RATIO
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-display text-[#0B0B0B]">
                {calculations.salvageRatio}%
              </span>
              <span
                className={`px-2 py-0.5 border border-[#0B0B0B] font-mono text-[10px] font-bold uppercase ${
                  calculations.economicVerdict === 'favors_repair'
                    ? 'bg-[#10B25A] text-white'
                    : calculations.economicVerdict === 'marginal'
                    ? 'bg-[#FFE600] text-[#0B0B0B]'
                    : 'bg-[#DC2626] text-white'
                }`}
              >
                {calculations.economicVerdict === 'favors_repair'
                  ? 'High Viability'
                  : calculations.economicVerdict === 'marginal'
                  ? 'Marginal'
                  : 'Uneconomical'}
              </span>
            </div>
            <p className="font-mono text-[10.5px] text-[#544E43] mt-2 border-t border-[#0B0B0B]/10 pt-1.5">
              Standard circular benchmark: Repairs costing under 50% of new outlay preserve maximum asset value.
            </p>
          </div>

          {/* Annualized Ownership Cost */}
          <div className="p-4 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]">
            <span className="font-mono text-[10px] text-[#6C6659] uppercase font-bold block mb-1">
              ANNUALIZED COST OF KEEPING
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-display text-[#2A5BFF]">
                {calculations.annualizedRepair !== null ? `₹${calculations.annualizedRepair.toLocaleString('en-IN')}/yr` : 'Unspecified'}
              </span>
              {calculations.annualizedReplace && (
                <span className="font-mono text-[11px] text-[#8C8476] line-through">
                  ₹{calculations.annualizedReplace.toLocaleString('en-IN')}/yr (New)
                </span>
              )}
            </div>
            <p className="font-mono text-[10.5px] text-[#544E43] mt-2 border-t border-[#0B0B0B]/10 pt-1.5">
              Cost amortized across remaining service life.
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side In-Depth Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPTION A: REPAIR PATHWAY */}
        <div
          className={`assessment-card p-6 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] space-y-4 flex flex-col justify-between ${
            selectedOutcome === 'repair' ? 'ring-4 ring-[#FFE600]' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B0B0B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#FFE600] border-2 border-[#0B0B0B] flex items-center justify-center shadow-[2px_2px_0px_#0B0B0B]">
                  <Wrench className="w-4 h-4 text-[#0B0B0B]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#6C6659] uppercase font-bold block">
                    CIRCULAR OPTION A
                  </span>
                  <h3 className="font-mono text-base font-black uppercase text-[#0B0B0B]">
                    Repair & Preserve
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] font-mono text-[10px] font-bold">
                  {repairSector.fitPercentage}% FIT
                </span>
                {isRepairRecommended && (
                  <span className="px-2 py-0.5 bg-[#10B25A] text-white border border-[#0B0B0B] font-mono text-[10px] font-bold">
                    ★ #1 RECOMMENDED
                  </span>
                )}
              </div>
            </div>

            {/* Price Metric */}
            <div className="p-3 bg-[#F4EFE2] border border-[#0B0B0B] my-3 font-mono">
              <span className="text-[#6C6659] text-[10px] uppercase font-bold block">UPFRONT OUTLAY</span>
              <strong className="text-xl text-[#0B0B0B]">
                {activeRepairCost !== null ? `₹ ${activeRepairCost.toLocaleString('en-IN')}` : 'Quote Unspecified'}
              </strong>
              {isSimulating && (
                <span className="text-[10px] text-[#2A5BFF] block font-bold mt-0.5">
                  [Simulated Estimate]
                </span>
              )}
            </div>

            {/* Key Advantages */}
            <div className="space-y-2 mb-4">
              <span className="font-mono text-xs font-bold text-[#0B0B0B] uppercase block">
                Advantages of Repairing:
              </span>
              <ul className="space-y-1.5 font-sans text-xs text-[#262422]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B25A] flex-none mt-0.5" />
                  <span><strong>Zero embodied carbon penalty:</strong> Avoids the heavy manufacturing footprint of producing replacement metals and silicon.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B25A] flex-none mt-0.5" />
                  <span><strong>Maximum capital retention:</strong> Preserves 100% of your current asset value without new device depreciation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B25A] flex-none mt-0.5" />
                  <span><strong>No software/data disruption:</strong> Your existing personalized settings, files, and physical familiarity remain unchanged.</span>
                </li>
              </ul>
            </div>

            {/* Key Disadvantages */}
            <div className="space-y-2 mb-4 border-t border-[#0B0B0B]/10 pt-3">
              <span className="font-mono text-xs font-bold text-[#6C6659] uppercase block">
                Trade-offs & Constraints:
              </span>
              <ul className="space-y-1.5 font-sans text-xs text-[#544E43]">
                <li className="flex items-start gap-2">
                  <span className="text-[#D97706] font-bold">●</span>
                  <span>Component risk: Older secondary parts (capacitors, rubber seals, batteries) may degrade later.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D97706] font-bold">●</span>
                  <span>Technician sourcing: Requires local diagnosis or modular parts delivery time.</span>
                </li>
              </ul>
            </div>

            {/* Multi-Criteria Dimension Breakdown */}
            {repairSector.scoreBreakdown && (
              <div className="border-t border-[#0B0B0B]/15 pt-3 font-mono text-[10.5px] space-y-1.5">
                <span className="font-bold text-[#0B0B0B] block text-[11px] uppercase">
                  Decision Engine Scoring:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-1 bg-[#F4EFE2] border border-[#0B0B0B]/30 flex justify-between">
                    <span className="text-[#6C6659]">Safety:</span>
                    <strong>{repairSector.scoreBreakdown.safety}/100</strong>
                  </div>
                  <div className="p-1 bg-[#F4EFE2] border border-[#0B0B0B]/30 flex justify-between">
                    <span className="text-[#6C6659]">Feasibility:</span>
                    <strong>{repairSector.scoreBreakdown.feasibility}/100</strong>
                  </div>
                  <div className="p-1 bg-[#F4EFE2] border border-[#0B0B0B]/30 flex justify-between">
                    <span className="text-[#6C6659]">Economics:</span>
                    <strong>{repairSector.scoreBreakdown.economicViability !== null ? `${repairSector.scoreBreakdown.economicViability}/100` : 'Unspecified'}</strong>
                  </div>
                  <div className="p-1 bg-[#F4EFE2] border border-[#0B0B0B]/30 flex justify-between">
                    <span className="text-[#6C6659]">Circularity:</span>
                    <strong>{repairSector.scoreBreakdown.circularImpact}/100</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t-2 border-[#0B0B0B]">
            <button
              type="button"
              disabled={isHazardous}
              onClick={() => {
                onSelectOutcome('repair');
                onProceedToActionPlan();
              }}
              className={`w-full py-2.5 px-4 font-mono font-bold text-xs uppercase border-2 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isHazardous
                  ? 'bg-[#F4EFE2] text-[#8C8476] opacity-50 cursor-not-allowed'
                  : 'bg-[#FFE600] text-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-[#FFE600]'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{isHazardous ? 'Repair Contraindicated (Hazard)' : 'Apply Repair Strategy →'}</span>
            </button>
          </div>
        </div>

        {/* OPTION B: REPLACE PATHWAY */}
        <div
          className={`assessment-card p-6 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] space-y-4 flex flex-col justify-between ${
            selectedOutcome === 'replace' ? 'ring-4 ring-[#FF9900]' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B0B0B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#FF9900] border-2 border-[#0B0B0B] flex items-center justify-center shadow-[2px_2px_0px_#0B0B0B]">
                  <ArrowUpRight className="w-4 h-4 text-[#0B0B0B]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#6C6659] uppercase font-bold block">
                    CIRCULAR OPTION B
                  </span>
                  <h3 className="font-mono text-base font-black uppercase text-[#0B0B0B]">
                    Replace & Upgrade
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#FF9900] text-white border border-[#0B0B0B] font-mono text-[10px] font-bold">
                  {replaceSector.fitPercentage}% FIT
                </span>
                {isReplaceRecommended && (
                  <span className="px-2 py-0.5 bg-[#10B25A] text-white border border-[#0B0B0B] font-mono text-[10px] font-bold">
                    ★ #1 RECOMMENDED
                  </span>
                )}
              </div>
            </div>

            {/* Price Metric */}
            <div className="p-3 bg-[#F4EFE2] border border-[#0B0B0B] my-3 font-mono">
              <span className="text-[#6C6659] text-[10px] uppercase font-bold block">ESTIMATED REPLACEMENT OUTLAY</span>
              <strong className="text-xl text-[#0B0B0B]">
                {activeReplaceCost !== null ? `₹ ${activeReplaceCost.toLocaleString('en-IN')}` : 'Price Unspecified'}
              </strong>
              {isSimulating && (
                <span className="text-[10px] text-[#2A5BFF] block font-bold mt-0.5">
                  [Simulated Estimate]
                </span>
              )}
            </div>

            {/* Key Advantages */}
            <div className="space-y-2 mb-4">
              <span className="font-mono text-xs font-bold text-[#0B0B0B] uppercase block">
                Advantages of Replacement:
              </span>
              <ul className="space-y-1.5 font-sans text-xs text-[#262422]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B25A] flex-none mt-0.5" />
                  <span><strong>Full warranty protection:</strong> Comes with fresh 1–3 year manufacturer replacement coverage and zero wear.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B25A] flex-none mt-0.5" />
                  <span><strong>Modern energy efficiency:</strong> Newer generation appliances (e.g., BEE 5-star inverters) cut recurring electrical bills significantly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B25A] flex-none mt-0.5" />
                  <span><strong>Immediate operational readiness:</strong> Essential if your urgency is high and parts lead time would disrupt daily life.</span>
                </li>
              </ul>
            </div>

            {/* Key Disadvantages */}
            <div className="space-y-2 mb-4 border-t border-[#0B0B0B]/10 pt-3">
              <span className="font-mono text-xs font-bold text-[#6C6659] uppercase block">
                Trade-offs & Constraints:
              </span>
              <ul className="space-y-1.5 font-sans text-xs text-[#544E43]">
                <li className="flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold">●</span>
                  <span>Full capital consumption: Requires spending the full replacement price immediately.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold">●</span>
                  <span>Scrappage burden: Old hardware must be responsibly recycled to avoid landfill pollution.</span>
                </li>
              </ul>
            </div>

            {/* Multi-Criteria Dimension Breakdown */}
            {replaceSector.scoreBreakdown && (
              <div className="border-t border-[#0B0B0B]/15 pt-3 font-mono text-[10.5px] space-y-1.5">
                <span className="font-bold text-[#0B0B0B] block text-[11px] uppercase">
                  Decision Engine Scoring:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-1 bg-[#F4EFE2] border border-[#0B0B0B]/30 flex justify-between">
                    <span className="text-[#6C6659]">Safety:</span>
                    <strong>{replaceSector.scoreBreakdown.safety}/100</strong>
                  </div>
                  <div className="p-1 bg-[#F4EFE2] border border-[#0B0B0B]/30 flex justify-between">
                    <span className="text-[#6C6659]">Feasibility:</span>
                    <strong>{replaceSector.scoreBreakdown.feasibility}/100</strong>
                  </div>
                  <div className="p-1 bg-[#F4EFE2] border border-[#0B0B0B]/30 flex justify-between">
                    <span className="text-[#6C6659]">Economics:</span>
                    <strong>{replaceSector.scoreBreakdown.economicViability !== null ? `${replaceSector.scoreBreakdown.economicViability}/100` : 'Unspecified'}</strong>
                  </div>
                  <div className="p-1 bg-[#F4EFE2] border border-[#0B0B0B]/30 flex justify-between">
                    <span className="text-[#6C6659]">Circularity:</span>
                    <strong>{replaceSector.scoreBreakdown.circularImpact}/100</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t-2 border-[#0B0B0B]">
            <button
              type="button"
              onClick={() => {
                onSelectOutcome('replace');
                onProceedToActionPlan();
              }}
              className="w-full py-2.5 px-4 font-mono font-bold text-xs uppercase border-2 border-[#0B0B0B] bg-[#FF9900] text-white hover:bg-[#0B0B0B] hover:text-[#FF9900] shadow-[2px_2px_0px_#0B0B0B] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Apply Replacement Strategy →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rationale Synthesis Box */}
      <div className="p-5 bg-[#F4EFE2] border-2 border-[#0B0B0B] font-mono text-xs space-y-2">
        <span className="font-bold text-[#0B0B0B] block text-[11px] uppercase flex items-center gap-2">
          <Award className="w-4 h-4 text-[#2A5BFF]" />
          DECISION ENGINE COMPARATIVE SYNTHESIS:
        </span>
        <p className="font-sans text-xs text-[#262422] leading-relaxed">
          The algorithmic recommendation is{' '}
          <strong className="uppercase font-mono font-black text-[#0B0B0B]">
            {tree.recommendedOutcome}
          </strong>{' '}
          ({tree.outcomes[tree.recommendedOutcome].fitPercentage}% match).{' '}
          {repairSector.comparativeRationale || replaceSector.comparativeRationale}
        </p>
      </div>
    </div>
  );
};
