import React from 'react';
import { HelpCircle, DollarSign } from 'lucide-react';
import type { AssessmentData } from './types';
import { BUDGET_OPTIONS, URGENCY_OPTIONS, PRIORITY_OPTIONS } from './questions';

interface StepCircumstancesProps {
  data: AssessmentData;
  onChange: (updates: Partial<AssessmentData>) => void;
  errors: Record<string, string>;
}

export const StepCircumstances: React.FC<StepCircumstancesProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-8">
      {/* Stage Explainer Banner */}
      <div className="p-4 bg-[#F4EFE2] border-2 border-[#0B0B0B] font-mono text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-[#0B0B0B]">
          <HelpCircle className="w-4 h-4 text-[#2A5BFF]" />
          <span>STAGE 3 GOAL: CONTEXT, ECONOMICS & PRIORITIES</span>
        </div>
        <p className="text-[#544E43] font-sans text-xs leading-relaxed">
          The best circular decision depends heavily on your real-world situation. An expensive repair might make sense for a beloved vintage piece with no budget limits, but not for a generic item when urgency is critical.
        </p>
      </div>

      {/* Economics Grid: Repair vs Replacement Quotes (Optional) */}
      <div className="p-5 bg-[#FFFDF5] border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#0B0B0B]/20">
          <span className="font-mono text-xs font-bold text-[#0B0B0B] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#10B25A]" />
            KNOWN COSTS & LIFESPAN (ALL OPTIONAL)
          </span>
          <span className="font-mono text-[10px] text-[#6C6659]">LEAVE BLANK IF UNKNOWN</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Repair Cost Field */}
          <div>
            <label htmlFor="repair-cost" className="assessment-label">
              <span className="assessment-label-title">Known Repair Cost or Quote</span>
              <span className="assessment-badge-optional">OPTIONAL</span>
            </label>
            <div className="assessment-currency-container mt-1">
              <span className="assessment-currency-prefix" aria-hidden="true">₹</span>
              <input
                id="repair-cost"
                type="number"
                min="0"
                step="50"
                disabled={data.repairCostUnknown}
                value={data.repairCost !== null ? data.repairCost : ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  onChange({ repairCost: val, repairCostUnknown: false });
                }}
                placeholder={data.repairCostUnknown ? 'Unknown / Not yet quoted' : '1,200'}
                className={`assessment-currency-input ${data.repairCostUnknown ? 'is-disabled' : ''}`}
              />
            </div>
            <label className="flex items-center gap-2 mt-2 font-mono text-[11px] text-[#6C6659] cursor-pointer">
              <input
                type="checkbox"
                checked={data.repairCostUnknown}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onChange({
                    repairCostUnknown: checked,
                    repairCost: checked ? null : data.repairCost,
                  });
                }}
                className="rounded-none border-2 border-[#0B0B0B] accent-[#FFE600]"
              />
              <span>I don't have a repair quote or parts price yet</span>
            </label>
          </div>

          {/* Replacement Cost Field */}
          <div>
            <label htmlFor="replace-cost" className="assessment-label">
              <span className="assessment-label-title">Cost to Replace New or Used</span>
              <span className="assessment-badge-optional">OPTIONAL</span>
            </label>
            <div className="assessment-currency-container mt-1">
              <span className="assessment-currency-prefix" aria-hidden="true">₹</span>
              <input
                id="replace-cost"
                type="number"
                min="0"
                step="100"
                disabled={data.replacementCostUnknown}
                value={data.replacementCost !== null ? data.replacementCost : ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  onChange({ replacementCost: val, replacementCostUnknown: false });
                }}
                placeholder={data.replacementCostUnknown ? 'Unknown / Not researched' : '8,500'}
                className={`assessment-currency-input ${data.replacementCostUnknown ? 'is-disabled' : ''}`}
              />
            </div>
            <label className="flex items-center gap-2 mt-2 font-mono text-[11px] text-[#6C6659] cursor-pointer">
              <input
                type="checkbox"
                checked={data.replacementCostUnknown}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onChange({
                    replacementCostUnknown: checked,
                    replacementCost: checked ? null : data.replacementCost,
                  });
                }}
                className="rounded-none border-2 border-[#0B0B0B] accent-[#FFE600]"
              />
              <span>I don't know the replacement price</span>
            </label>
          </div>
        </div>

        {/* Expected Lifespan Field */}
        <div className="pt-4 border-t border-[#0B0B0B]/10">
          <label htmlFor="lifespan" className="assessment-label">
            <span className="assessment-label-title">Expected Additional Lifespan (Years)</span>
            <span className="assessment-badge-optional">OPTIONAL</span>
          </label>
          <div className="relative mt-1 max-w-sm">
            <input
              id="lifespan"
              type="number"
              min="1"
              max="25"
              disabled={data.expectedLifespanUnknown}
              value={data.expectedLifespanYears !== null ? data.expectedLifespanYears : ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                onChange({ expectedLifespanYears: val, expectedLifespanUnknown: false });
              }}
              placeholder={data.expectedLifespanUnknown ? 'Unknown' : 'e.g. 3'}
              className={`auth-input text-sm ${data.expectedLifespanUnknown ? 'bg-[#F4EFE2] text-[#6C6659]' : ''}`}
            />
          </div>
          <label className="flex items-center gap-2 mt-2 font-mono text-[11px] text-[#6C6659] cursor-pointer">
            <input
              type="checkbox"
              checked={data.expectedLifespanUnknown}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange({
                  expectedLifespanUnknown: checked,
                  expectedLifespanYears: checked ? null : data.expectedLifespanYears,
                });
              }}
              className="rounded-none border-2 border-[#0B0B0B] accent-[#FFE600]"
            />
            <span>I have no estimate for extended lifespan</span>
          </label>
        </div>
      </div>

      {/* Primary Priority (Required) */}
      <div>
        <label className="assessment-label mb-1">
          <span className="assessment-label-title">
            Primary Decision Priority <span className="text-[#FF3344]">*</span>
          </span>
          <span className="assessment-badge-required">REQUIRED</span>
        </label>
        <p className="text-xs text-[#6C6659] mb-4 font-sans">
          What matters most to you for this specific item?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRIORITY_OPTIONS.map((p) => {
            const isSelected = data.primaryPriority === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ primaryPriority: p.id })}
                className={`
                  p-4 border-2 text-left transition-all
                  ${isSelected ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] -translate-x-0.5 -translate-y-0.5' : 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2] shadow-[2px_2px_0px_#0B0B0B]'}
                `}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 bg-[#FFFDF5] border border-[#0B0B0B]">
                    {p.badge}
                  </span>
                  {isSelected && (
                    <span className="font-mono text-[10px] font-bold text-[#0B0B0B]">✓ SELECTED</span>
                  )}
                </div>
                <strong className="font-mono text-sm text-[#0B0B0B] block mb-1">
                  {p.label}
                </strong>
                <p className="font-sans text-xs text-[#544E43] leading-relaxed">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>

        {errors.primaryPriority && (
          <p className="auth-error-msg mt-2" role="alert">
            {errors.primaryPriority}
          </p>
        )}
      </div>

      {/* Budget Constraint & Urgency Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#0B0B0B]/15">
        {/* Budget */}
        <div>
          <label className="assessment-label mb-1">
            <span className="assessment-label-title">
              Budget Flexibility <span className="text-[#FF3344]">*</span>
            </span>
            <span className="assessment-badge-required">REQUIRED</span>
          </label>
          <div className="space-y-2 mt-2">
            {BUDGET_OPTIONS.map((b) => {
              const isSelected = data.budgetConstraint === b.id;

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onChange({ budgetConstraint: b.id })}
                  className={`
                    w-full p-3 border-2 text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1
                    ${isSelected ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] font-bold' : 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2]'}
                  `}
                >
                  <span className="font-mono text-xs text-[#0B0B0B]">{b.label}</span>
                  <span className="text-[11px] text-[#6C6659] font-sans leading-tight">{b.description}</span>
                </button>
              );
            })}
          </div>

          {errors.budgetConstraint && (
            <p className="auth-error-msg mt-2" role="alert">
              {errors.budgetConstraint}
            </p>
          )}
        </div>

        {/* Urgency */}
        <div>
          <label className="assessment-label mb-1">
            <span className="assessment-label-title">
              Time Urgency <span className="text-[#FF3344]">*</span>
            </span>
            <span className="assessment-badge-required">REQUIRED</span>
          </label>
          <div className="space-y-2 mt-2">
            {URGENCY_OPTIONS.map((u) => {
              const isSelected = data.urgency === u.id;

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onChange({ urgency: u.id })}
                  className={`
                    w-full p-3 border-2 text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1
                    ${isSelected ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B] font-bold' : 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2]'}
                  `}
                >
                  <span className="font-mono text-xs text-[#0B0B0B]">{u.label}</span>
                  <span className="text-[11px] text-[#6C6659] font-sans leading-tight">{u.description}</span>
                </button>
              );
            })}
          </div>

          {errors.urgency && (
            <p className="auth-error-msg mt-2" role="alert">
              {errors.urgency}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
