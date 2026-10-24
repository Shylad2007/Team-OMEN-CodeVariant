import React from 'react';
import {
  X,
  Wrench,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Trash2,
  Package,
  CheckCircle2,
  Leaf,
  DollarSign,
  ShieldCheck,
  Award,
} from 'lucide-react';
import type { EvaluatedCircularTree, OutcomeType } from './circularTreeTypes';

interface CircularNodeInspectorProps {
  nodeId: string | null;
  tree: EvaluatedCircularTree;
  activeBranchId: string | null;
  onClose: () => void;
  onSelectBranch: (branchId: string) => void;
  onContinueToActionPlan?: () => void;
}

export const CircularNodeInspector: React.FC<CircularNodeInspectorProps> = ({
  nodeId,
  tree,
  activeBranchId,
  onClose,
  onSelectBranch,
  onContinueToActionPlan,
}) => {
  if (!nodeId) return null;

  const getOutcomeIcon = (type: OutcomeType) => {
    switch (type) {
      case 'repair':
        return <Wrench className="w-5 h-5 text-[#0B0B0B]" />;
      case 'reuse':
        return <RefreshCw className="w-5 h-5 text-[#0B0B0B]" />;
      case 'repurpose':
        return <Sparkles className="w-5 h-5 text-[#0B0B0B]" />;
      case 'replace':
        return <ArrowUpRight className="w-5 h-5 text-[#0B0B0B]" />;
      case 'recycle':
        return <Trash2 className="w-5 h-5 text-[#0B0B0B]" />;
      default:
        return <Award className="w-5 h-5 text-[#0B0B0B]" />;
    }
  };

  // 1. Central Product Node Inspector
  if (nodeId === 'product_center') {
    const product = tree.product;
    return (
      <div className="p-5 sm:p-6 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] space-y-4 max-w-lg w-full">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B0B0B]">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0B0B0B]" />
            <h3 className="font-mono text-sm font-black uppercase text-[#0B0B0B]">
              ASSESSED ITEM SPECIFICATION
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#F4EFE2] border border-[#0B0B0B] text-[#0B0B0B]"
            title="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="font-display font-black text-xl text-[#0B0B0B] mb-1">
            {product.name}
          </h2>
          {product.brandModel && (
            <span className="font-mono text-xs text-[#6C6659] block">
              MODEL: {product.brandModel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-2.5 bg-[#F4EFE2] border border-[#0B0B0B]">
            <span className="text-[#6C6659] text-[10px] block mb-0.5">CATEGORY</span>
            <strong className="text-[#0B0B0B] uppercase">{product.category}</strong>
          </div>
          <div className="p-2.5 bg-[#F4EFE2] border border-[#0B0B0B]">
            <span className="text-[#6C6659] text-[10px] block mb-0.5">CONDITION GRADE</span>
            <strong className="text-[#0B0B0B]">{product.condition?.replace(/_/g, ' ') || 'Assessed'}</strong>
          </div>
        </div>

        <div>
          <span className="font-mono text-[10px] font-bold text-[#6C6659] uppercase block mb-1">
            REPORTED SYMPTOM / DEFECT:
          </span>
          <p className="p-3 bg-[#F4EFE2] border border-[#0B0B0B] font-sans text-xs text-[#262422] leading-relaxed">
            {product.reportedFault}
          </p>
        </div>

        <div className="p-3 bg-[#FFE600] border-2 border-[#0B0B0B] font-mono text-xs">
          <span className="font-bold text-[#0B0B0B] block text-[11px] mb-1">
            CIRCULAR VERDICT SYNTHESIS:
          </span>
          <p className="font-sans text-xs text-[#0B0B0B] leading-snug">
            Evaluated against R3VIVE circular decision hierarchy. Highest viability pathway is{' '}
            <strong className="uppercase font-mono font-black">{tree.recommendedOutcome}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // 2. Outcome Sector Node Inspector
  if (nodeId.startsWith('outcome_')) {
    const outcomeType = nodeId.replace('outcome_', '') as OutcomeType;
    const sector = tree.outcomes[outcomeType];
    if (!sector) return null;

    const isRecommended = outcomeType === tree.recommendedOutcome;

    return (
      <div className="p-5 sm:p-6 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] space-y-4 max-w-lg w-full">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B0B0B]">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 ${sector.bannerBg} border border-[#0B0B0B]`}>
              {getOutcomeIcon(outcomeType)}
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#6C6659] uppercase block font-bold">
                CIRCULAR OUTCOME SECTOR
              </span>
              <h3 className="font-mono text-sm font-black uppercase text-[#0B0B0B]">
                {sector.title} ({sector.fitPercentage}% FIT)
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#F4EFE2] border border-[#0B0B0B] text-[#0B0B0B]"
            title="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isRecommended ? (
          <div className="p-2.5 bg-[#FFE600] border-2 border-[#0B0B0B] font-mono text-xs font-bold text-[#0B0B0B] flex items-center gap-1.5 shadow-[2px_2px_0px_#0B0B0B]">
            <CheckCircle2 className="w-4 h-4 text-[#0B0B0B]" />
            <span>PRIMARY RECOMMENDED OUTCOME (ALGORITHM RANK #1)</span>
          </div>
        ) : (
          <div className="p-2 bg-[#F4EFE2] border border-[#0B0B0B] font-mono text-[11px] text-[#6C6659] flex items-center justify-between">
            <span className="font-bold text-[#0B0B0B]">ALTERNATIVE CIRCULAR PATHWAY</span>
            <span>RANK #{tree.rankingOrder ? tree.rankingOrder.indexOf(outcomeType) + 1 : '—'} OF 5</span>
          </div>
        )}

        <p className="font-sans text-xs text-[#262422] leading-relaxed bg-[#F4EFE2] p-3 border border-[#0B0B0B]/30">
          {sector.summary}
        </p>

        {sector.comparativeRationale && (
          <div>
            <span className="font-mono text-[11px] font-bold text-[#0B0B0B] uppercase block mb-1">
              DECISION REASONING:
            </span>
            <p className="font-sans text-xs text-[#262422] leading-relaxed bg-[#F4EFE2] p-2.5 border border-[#0B0B0B]/40">
              {sector.comparativeRationale}
            </p>
          </div>
        )}

        {sector.scoreBreakdown && (
          <div>
            <span className="font-mono text-[11px] font-bold text-[#0B0B0B] uppercase block mb-1.5">
              MULTI-CRITERIA EVALUATION SCORE:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[10.5px]">
              <div className="p-1.5 bg-[#F4EFE2] border border-[#0B0B0B]/40">
                <span className="text-[#6C6659] block text-[9px]">SAFETY</span>
                <strong className="text-[#0B0B0B]">{sector.scoreBreakdown.safety}/100</strong>
              </div>
              <div className="p-1.5 bg-[#F4EFE2] border border-[#0B0B0B]/40">
                <span className="text-[#6C6659] block text-[9px]">FEASIBILITY</span>
                <strong className="text-[#0B0B0B]">{sector.scoreBreakdown.feasibility}/100</strong>
              </div>
              <div className="p-1.5 bg-[#F4EFE2] border border-[#0B0B0B]/40">
                <span className="text-[#6C6659] block text-[9px]">ECONOMICS</span>
                <strong className="text-[#0B0B0B]">
                  {sector.scoreBreakdown.economicViability !== null ? `${sector.scoreBreakdown.economicViability}/100` : 'Unspecified'}
                </strong>
              </div>
              <div className="p-1.5 bg-[#F4EFE2] border border-[#0B0B0B]/40">
                <span className="text-[#6C6659] block text-[9px]">CIRCULAR RETENTION</span>
                <strong className="text-[#0B0B0B]">{sector.scoreBreakdown.circularImpact}/100</strong>
              </div>
              <div className="p-1.5 bg-[#F4EFE2] border border-[#0B0B0B]/40 col-span-2 sm:col-span-1">
                <span className="text-[#6C6659] block text-[9px]">PRIORITY MATCH</span>
                <strong className="text-[#0B0B0B]">{sector.scoreBreakdown.userAlignment}/100</strong>
              </div>
            </div>
          </div>
        )}

        {sector.dataLimitations && sector.dataLimitations.length > 0 && (
          <div className="p-2 bg-[#FFFBEB] border border-[#D97706] font-mono text-[10.5px] text-[#B45309]">
            <span className="font-bold block mb-0.5">DATA LIMITATION ACKNOWLEDGED:</span>
            {sector.dataLimitations.map((lim, lIdx) => (
              <span key={lIdx} className="block">• {lim}</span>
            ))}
          </div>
        )}

        <div>
          <span className="font-mono text-xs font-bold text-[#0B0B0B] uppercase block mb-1.5">
            Decision Drivers:
          </span>
          <ul className="space-y-1 font-mono text-xs text-[#0B0B0B]">
            {sector.keyDrivers.map((driver, dIdx) => (
              <li key={dIdx} className="flex items-center gap-1.5">
                <span className="text-[#10B25A] font-bold">●</span>
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="font-mono text-xs font-bold text-[#0B0B0B] uppercase block mb-2">
            Available Radial Sub-Branches:
          </span>
          <div className="space-y-2">
            {sector.subBranches.map((branch) => {
              const isActive = activeBranchId === branch.id;
              return (
                <div
                  key={branch.id}
                  className={`p-3 border-2 transition-all flex items-center justify-between gap-2 ${
                    isActive ? 'bg-[#FFE600]/30 border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]' : 'bg-[#FFFDF5] border-[#0B0B0B]/40'
                  }`}
                >
                  <div className="min-w-0">
                    <strong className="font-mono text-xs text-[#0B0B0B] block truncate">
                      {branch.title}
                    </strong>
                    <span className="text-[11px] font-sans text-[#544E43] block">
                      {branch.description}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectBranch(branch.id)}
                    className="px-2.5 py-1 bg-[#FFE600] border border-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-[#FFE600] font-mono text-[10px] font-bold shrink-0 transition-colors"
                  >
                    {isActive ? 'Active' : 'Inspect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {onContinueToActionPlan && (
          <div className="pt-3 border-t border-[#0B0B0B]/20 flex flex-col gap-2">
            <button
              type="button"
              onClick={onContinueToActionPlan}
              className="w-full py-2 px-3 bg-[#FFE600] hover:bg-[#0B0B0B] hover:text-[#FFE600] border-2 border-[#0B0B0B] font-mono text-xs font-bold text-[#0B0B0B] text-center flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#0B0B0B] transition-colors cursor-pointer"
            >
              <span>Continue to Action Plan →</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. Sub-Branch Node Inspector
  let foundBranch = null;
  for (const sector of Object.values(tree.outcomes)) {
    const branch = sector.subBranches.find((b) => b.id === nodeId);
    if (branch) {
      foundBranch = branch;
      break;
    }
  }

  if (foundBranch) {
    const plan = foundBranch.actionPlan;
    const isActive = activeBranchId === foundBranch.id;

    return (
      <div className="p-5 sm:p-6 bg-[#FFFDF5] border-3 border-[#0B0B0B] shadow-[6px_6px_0px_#0B0B0B] space-y-4 max-w-lg w-full">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B0B0B]">
          <div>
            <span className="font-mono text-[10px] text-[#2A5BFF] uppercase block font-bold">
              CIRCULAR SUB-BRANCH ACTION PLAN
            </span>
            <h3 className="font-mono text-sm font-black uppercase text-[#0B0B0B]">
              {foundBranch.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#F4EFE2] border border-[#0B0B0B] text-[#0B0B0B]"
            title="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h4 className="font-mono text-sm font-bold text-[#0B0B0B] mb-1">
            {plan.headline}
          </h4>
          <p className="font-sans text-xs text-[#262422] leading-relaxed bg-[#F4EFE2] p-3 border border-[#0B0B0B]/30">
            {plan.rationale}
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          <div className="p-2 bg-[#F4EFE2] border border-[#0B0B0B]">
            <span className="text-[#6C6659] text-[9px] block mb-0.5 flex items-center gap-1">
              <Leaf className="w-3 h-3 text-[#10B25A]" />
              MATERIALS
            </span>
            <strong className="text-[#0B0B0B] text-[10.5px] block truncate" title={plan.wasteSavedEstimate}>
              {plan.wasteSavedEstimate}
            </strong>
          </div>

          <div className="p-2 bg-[#F4EFE2] border border-[#0B0B0B]">
            <span className="text-[#6C6659] text-[9px] block mb-0.5 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#FFE600]" />
              ECONOMICS
            </span>
            <strong className="text-[#0B0B0B] text-[10.5px] block truncate" title={plan.costEfficiency}>
              {plan.costEfficiency}
            </strong>
          </div>

          <div className="p-2 bg-[#F4EFE2] border border-[#0B0B0B]">
            <span className="text-[#6C6659] text-[9px] block mb-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#2A5BFF]" />
              FEASIBILITY
            </span>
            <strong className="text-[#0B0B0B] text-[10.5px] block truncate">{plan.feasibility}</strong>
          </div>

          <div className="p-2 bg-[#F4EFE2] border border-[#0B0B0B]">
            <span className="text-[#6C6659] text-[9px] block mb-0.5 flex items-center gap-1">
              <Award className="w-3 h-3 text-[#0B0B0B]" />
              CONFIDENCE
            </span>
            <strong className="text-[#0B0B0B] text-[10.5px] block">
              {plan.confidenceLevel || 'Moderate'} ({plan.confidenceScore}%)
            </strong>
          </div>
        </div>

        {/* Step-by-Step Action Steps */}
        <div>
          <span className="font-mono text-xs font-bold text-[#0B0B0B] uppercase block mb-1.5">
            Recommended Implementation Steps:
          </span>
          <ol className="space-y-1.5 font-sans text-xs text-[#0B0B0B] list-decimal list-inside bg-[#FFFDF5] p-3 border border-[#0B0B0B]">
            {plan.recommendedSteps.map((step, sIdx) => (
              <li key={sIdx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="pt-3 border-t border-[#0B0B0B]/20 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onSelectBranch(foundBranch.id)}
            className={`assessment-nav-btn text-xs py-2 px-4 font-mono font-bold justify-center ${
              isActive ? 'bg-[#0B0B0B] text-[#FFE600]' : 'bg-[#FFE600] text-[#0B0B0B]'
            }`}
          >
            {isActive ? '✓ Selected as Active Path' : 'Select as Active Circular Path'}
          </button>
          {onContinueToActionPlan && (
            <button
              type="button"
              onClick={onContinueToActionPlan}
              className="assessment-nav-btn bg-[#2A5BFF] text-white hover:bg-[#0B0B0B] hover:text-[#FFE600] text-xs py-2 px-4 font-mono font-bold justify-center shadow-[2px_2px_0px_#0B0B0B] flex items-center gap-1.5"
            >
              <span>Continue to Action Plan →</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
