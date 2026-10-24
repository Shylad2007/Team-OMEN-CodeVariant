import React from 'react';
import { Edit2, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import type { AssessmentData, AssessmentStage } from './types';
import { CATEGORIES, CONDITIONS, ITEM_AGES, BUDGET_OPTIONS, URGENCY_OPTIONS, PRIORITY_OPTIONS, ADAPTIVE_QUESTIONS } from './questions';

interface StepReviewProps {
  data: AssessmentData;
  onNavigateToStage: (stage: AssessmentStage) => void;
  onReset: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  data,
  onNavigateToStage,
  onReset,
}) => {
  const categoryObj = CATEGORIES.find((c) => c.id === data.category);
  const conditionObj = CONDITIONS.find((c) => c.id === data.condition);
  const ageObj = ITEM_AGES.find((a) => a.id === data.age);
  const budgetObj = BUDGET_OPTIONS.find((b) => b.id === data.budgetConstraint);
  const urgencyObj = URGENCY_OPTIONS.find((u) => u.id === data.urgency);
  const priorityObj = PRIORITY_OPTIONS.find((p) => p.id === data.primaryPriority);

  return (
    <div className="space-y-8">
      {/* Verification Banner */}
      <div className="p-5 bg-[#FFE600] border-2 border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] font-mono">
        <div className="flex items-center gap-2 font-black text-sm text-[#0B0B0B] mb-1">
          <CheckCircle2 className="w-5 h-5 text-[#0B0B0B]" />
          <span>STAGE 5: ITEM ASSESSMENT VERIFIED & READY FOR DECISION ENGINE</span>
        </div>
        <p className="text-xs text-[#262422] font-sans leading-relaxed">
          Your diagnostic inputs have been recorded and validated. Review your item details below, then launch the Circular Decision Tree to view the radial 5-outcome matrix.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-5">
        {/* Card 1: Identity */}
        <div className="p-5 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#0B0B0B]/20">
            <span className="font-mono text-xs font-bold text-[#0B0B0B]">
              01. ITEM IDENTITY
            </span>
            <button
              type="button"
              onClick={() => onNavigateToStage(1)}
              className="text-xs font-mono font-bold text-[#2A5BFF] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <span className="text-[#6C6659] block mb-0.5">ITEM NAME:</span>
              <strong className="text-sm text-[#0B0B0B] block">{data.itemName}</strong>
            </div>

            <div>
              <span className="text-[#6C6659] block mb-0.5">CATEGORY:</span>
              <span className="font-bold text-[#0B0B0B]">
                {categoryObj?.label || 'Not set'}
                {data.customCategory ? ` (${data.customCategory})` : ''}
              </span>
            </div>

            {data.brandModel && (
              <div className="sm:col-span-2">
                <span className="text-[#6C6659] block mb-0.5">BRAND / MODEL:</span>
                <span className="text-[#0B0B0B]">{data.brandModel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Condition & Fault */}
        <div className="p-5 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#0B0B0B]/20">
            <span className="font-mono text-xs font-bold text-[#0B0B0B]">
              02. PHYSICAL CONDITION & DEFECTS
            </span>
            <button
              type="button"
              onClick={() => onNavigateToStage(2)}
              className="text-xs font-mono font-bold text-[#2A5BFF] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[#6C6659] block mb-0.5">ITEM AGE:</span>
                <span className="font-bold text-[#0B0B0B]">{ageObj?.label || 'Not set'}</span>
              </div>

              <div>
                <span className="text-[#6C6659] block mb-0.5">OPERATIONAL GRADE:</span>
                <span className="font-bold text-[#0B0B0B]">
                  {conditionObj?.badge} — {conditionObj?.label}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[#6C6659] block mb-0.5">REPORTED FAULT:</span>
              <p className="font-sans text-xs text-[#262422] p-3 bg-[#F4EFE2] border border-[#0B0B0B] leading-relaxed">
                {data.reportedFault}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Circumstances & Economics */}
        <div className="p-5 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#0B0B0B]/20">
            <span className="font-mono text-xs font-bold text-[#0B0B0B]">
              03. CONTEXT & ECONOMICS
            </span>
            <button
              type="button"
              onClick={() => onNavigateToStage(3)}
              className="text-xs font-mono font-bold text-[#2A5BFF] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <span className="text-[#6C6659] block mb-0.5">PRIMARY PRIORITY:</span>
              <strong className="text-[#0B0B0B] block">{priorityObj?.label || 'Not set'}</strong>
            </div>

            <div>
              <span className="text-[#6C6659] block mb-0.5">BUDGET FLEXIBILITY:</span>
              <span className="text-[#0B0B0B]">{budgetObj?.label || 'Not set'}</span>
            </div>

            <div>
              <span className="text-[#6C6659] block mb-0.5">TIME URGENCY:</span>
              <span className="text-[#0B0B0B]">{urgencyObj?.label || 'Not set'}</span>
            </div>

            <div>
              <span className="text-[#6C6659] block mb-0.5">KNOWN REPAIR COST:</span>
              <span className="text-[#0B0B0B]">
                {data.repairCost !== null ? `₹${data.repairCost.toLocaleString('en-IN')}` : 'Unknown / Unquoted'}
              </span>
            </div>

            <div>
              <span className="text-[#6C6659] block mb-0.5">REPLACEMENT PRICE:</span>
              <span className="text-[#0B0B0B]">
                {data.replacementCost !== null ? `₹${data.replacementCost.toLocaleString('en-IN')}` : 'Unknown / Unresearched'}
              </span>
            </div>

            <div>
              <span className="text-[#6C6659] block mb-0.5">EXPECTED LIFESPAN:</span>
              <span className="text-[#0B0B0B]">
                {data.expectedLifespanYears !== null ? `+${data.expectedLifespanYears} Years` : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Category Adaptive Diagnostics */}
        <div className="p-5 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#0B0B0B]/20">
            <span className="font-mono text-xs font-bold text-[#0B0B0B]">
              04. CATEGORY ADAPTIVE DIAGNOSTICS
            </span>
            <button
              type="button"
              onClick={() => onNavigateToStage(4)}
              className="text-xs font-mono font-bold text-[#2A5BFF] hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {(() => {
              const validEntries = Object.entries(data.adaptiveAnswers || {}).filter(
                ([qId, val]) => !qId.startsWith('_') && val !== null && val !== undefined
              );

              if (validEntries.length === 0) {
                return (
                  <p className="text-[#6C6659]">
                    Standard category questions checked.{' '}
                    <button
                      type="button"
                      onClick={() => onNavigateToStage(4)}
                      className="text-[#2A5BFF] underline font-bold"
                    >
                      Inspect Stage 4 Questions →
                    </button>
                  </p>
                );
              }

              return validEntries.map(([qId, val]) => {
                const qObj = ADAPTIVE_QUESTIONS.find((q) => q.id === qId);
                const optObj = qObj?.options.find((o) => o.value === val);
                const displayVal =
                  optObj?.label ||
                  (typeof val === 'string'
                    ? val
                    : typeof val === 'object' && val !== null
                    ? Object.keys(val).join(', ')
                    : String(val));

                return (
                  <div key={qId} className="p-3 bg-[#F4EFE2] border border-[#0B0B0B]">
                    <span className="text-[#6C6659] block text-[11px] font-bold">
                      {qObj?.title || qId}:
                    </span>
                    <strong className="text-[#0B0B0B] text-xs">
                      {displayVal}
                    </strong>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Transition to Dedicated Decision Tree */}
      <div className="p-6 bg-[#F4EFE2] border-2 border-[#0B0B0B] space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0B0B0B] pb-2 border-b border-[#0B0B0B]/20">
          <Sparkles className="w-4 h-4 text-[#2A5BFF]" />
          <span>READY TO GENERATE CIRCULAR DECISION MATRIX</span>
        </div>

        <p className="font-sans text-xs text-[#544E43] leading-relaxed">
          All item parameters are valid. Continuing launches the dedicated <strong>Circular Decision Tree</strong> on an expansive canvas, arranging all five circular pathways (Repair, Reuse, Repurpose, Replace, and Recycle) radially around this item.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onReset}
            className="assessment-nav-btn assessment-nav-btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
