import React from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import type { AssessmentData } from './types';
import { ITEM_AGES, CONDITIONS } from './questions';

interface StepConditionFaultProps {
  data: AssessmentData;
  onChange: (updates: Partial<AssessmentData>) => void;
  errors: Record<string, string>;
}

export const StepConditionFault: React.FC<StepConditionFaultProps> = ({
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
          <span>STAGE 2 GOAL: PHYSICAL CONDITION & OBSERVED DEFECTS</span>
        </div>
        <p className="text-[#544E43] font-sans text-xs leading-relaxed">
          The severity of wear and nature of the defect determine whether a component-level repair is viable or if the item is approaching structural end-of-life.
        </p>
      </div>

      {/* Item Age Selector */}
      <div>
        <label className="assessment-label mb-1">
          <span className="assessment-label-title">
            1. Estimated Item Age <span className="text-[#FF3344]">*</span>
          </span>
          <span className="assessment-badge-required">REQUIRED</span>
        </label>
        <p className="text-xs text-[#6C6659] mb-3 font-sans">
          How long has this item been in service?
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {ITEM_AGES.map((ageOpt) => {
            const isSelected = data.age === ageOpt.id;

            return (
              <button
                key={ageOpt.id}
                type="button"
                onClick={() => onChange({ age: ageOpt.id })}
                className={`
                  p-3 border-2 text-left transition-all
                  ${isSelected ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[3px_3px_0px_#0B0B0B] font-bold' : 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2] shadow-[1px_1px_0px_#0B0B0B]'}
                `}
              >
                <div className="flex items-center justify-between font-mono text-xs font-bold text-[#0B0B0B] mb-1">
                  <span>{ageOpt.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0B0B0B]" />}
                </div>
                <p className="text-[10px] text-[#6C6659] font-sans leading-tight">
                  {ageOpt.hint}
                </p>
              </button>
            );
          })}
        </div>

        {errors.age && (
          <p className="auth-error-msg mt-2" role="alert">
            {errors.age}
          </p>
        )}
      </div>

      {/* Condition Grade Cards */}
      <div>
        <label className="assessment-label mb-1">
          <span className="assessment-label-title">
            2. Current Operational Condition <span className="text-[#FF3344]">*</span>
          </span>
          <span className="assessment-badge-required">REQUIRED</span>
        </label>
        <p className="text-xs text-[#6C6659] mb-4 font-sans">
          Select the option that most honestly reflects its current state.
        </p>

        <div className="space-y-3">
          {CONDITIONS.map((cond) => {
            const isSelected = data.condition === cond.id;

            return (
              <button
                key={cond.id}
                type="button"
                onClick={() => onChange({ condition: cond.id })}
                className={`
                  w-full p-4 border-2 text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3
                  ${isSelected ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[4px_4px_0px_#0B0B0B] -translate-x-0.5 -translate-y-0.5' : 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2] shadow-[2px_2px_0px_#0B0B0B]'}
                `}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="font-mono text-[10px] font-black px-2 py-0.5 border border-[#0B0B0B] shrink-0"
                      style={{
                        backgroundColor: cond.badgeColor,
                        color: cond.id === 'broken_non_functional' || cond.id === 'severe_structural_failure' ? '#FFFDF5' : '#0B0B0B',
                      }}
                    >
                      {cond.badge}
                    </span>
                    <strong className="font-mono text-sm text-[#0B0B0B]">
                      {cond.label}
                    </strong>
                  </div>
                  <p className="text-xs font-sans text-[#262422] max-w-xl leading-relaxed">
                    {cond.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 font-mono text-xs font-bold">
                  {isSelected ? (
                    <span className="px-2.5 py-1 bg-[#0B0B0B] text-[#FFE600] border border-[#0B0B0B]">
                      SELECTED
                    </span>
                  ) : (
                    <span className="text-[#6C6659]">Select →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {errors.condition && (
          <p className="auth-error-msg mt-2" role="alert">
            {errors.condition}
          </p>
        )}
      </div>

      {/* Reported Fault Textarea */}
      <div>
        <label htmlFor="reported-fault" className="assessment-label">
          <span className="assessment-label-title">
            3. Describe the Fault or Reason for Discarding <span className="text-[#FF3344]">*</span>
          </span>
          <span className="assessment-badge-required">REQUIRED</span>
        </label>
        <p className="text-xs text-[#6C6659] mb-2 font-sans">
          What specifically went wrong? (e.g., “Coffee machine turns on and heats up, but the water pump makes loud buzzing and doesn't push water through the portafilter.”)
        </p>
        <textarea
          id="reported-fault"
          rows={4}
          value={data.reportedFault}
          onChange={(e) => onChange({ reportedFault: e.target.value })}
          placeholder="Describe symptoms, noise, visible cracks, error lights, or missing pieces..."
          className={`auth-input text-sm leading-relaxed ${errors.reportedFault ? 'has-error' : ''}`}
        />
        {errors.reportedFault && (
          <p className="auth-error-msg mt-1.5" role="alert">
            {errors.reportedFault}
          </p>
        )}
      </div>
    </div>
  );
};
