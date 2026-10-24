import React from 'react';
import { Check, Circle } from 'lucide-react';
import type { AssessmentStage } from './types';

interface AssessmentStepperProps {
  currentStage: AssessmentStage;
  onSelectStage?: (stage: AssessmentStage) => void;
}

const STAGES: { stage: AssessmentStage; title: string; shortTitle: string; subtitle: string }[] = [
  { stage: 1, title: 'Item Identity', shortTitle: 'Identity', subtitle: 'Category & Name' },
  { stage: 2, title: 'Condition & Fault', shortTitle: 'Condition', subtitle: 'Age & Defects' },
  { stage: 3, title: 'Circumstances', shortTitle: 'Context', subtitle: 'Costs & Priority' },
  { stage: 4, title: 'Adaptive Branches', shortTitle: 'Adaptive', subtitle: 'Category Diagnostics' },
  { stage: 5, title: 'Review Answers', shortTitle: 'Review', subtitle: 'Synthesis' },
];

export const AssessmentStepper: React.FC<AssessmentStepperProps> = ({
  currentStage,
  onSelectStage,
}) => {
  const progressPercent = Math.round(((currentStage - 1) / (STAGES.length - 1)) * 100);

  return (
    <div className="dashboard-card p-4 sm:p-6 bg-[#FFFDF5] mb-6 sm:mb-8">
      {/* Top Progress Metric */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 font-mono text-xs font-bold">
        <span className="text-[#0B0B0B] uppercase tracking-wider text-[11px] sm:text-xs">
          ASSESSMENT PROGRESS: STAGE {currentStage} OF {STAGES.length}
        </span>
        <span className="px-2 py-0.5 bg-[#FFE600] border border-[#0B0B0B] text-[#0B0B0B] text-[11px] sm:text-xs font-black">
          {progressPercent}% COMPLETE
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2.5 sm:h-3 bg-[#F4EFE2] border-2 border-[#0B0B0B] mb-4 sm:mb-5 p-0.5">
        <div
          className="h-full bg-[#FFE600] border-r border-[#0B0B0B] transition-all duration-300"
          style={{ width: `${Math.max(5, progressPercent)}%` }}
        />
      </div>

      {/* Step Pills */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 font-mono">
        {STAGES.map((s) => {
          const isCompleted = s.stage < currentStage;
          const isCurrent = s.stage === currentStage;
          const isClickable = onSelectStage && s.stage < currentStage;

          return (
            <button
              key={s.stage}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectStage(s.stage)}
              className={`
                text-left p-1.5 sm:p-2.5 border-2 transition-all flex flex-col justify-between min-w-0
                ${isCurrent ? 'bg-[#FFE600] border-[#0B0B0B] shadow-[2px_2px_0px_#0B0B0B]' : ''}
                ${isCompleted ? 'bg-[#FFFDF5] border-[#0B0B0B] hover:bg-[#F4EFE2] cursor-pointer' : ''}
                ${!isCompleted && !isCurrent ? 'bg-[#F4EFE2] border-[#0B0B0B]/30 opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase mb-1">
                <span>0{s.stage}</span>
                {isCompleted && <Check className="w-3 h-3 text-[#10B25A]" />}
                {isCurrent && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0B0B0B]" />}
                {!isCompleted && !isCurrent && <Circle className="w-2.5 h-2.5 text-[#6C6659]" />}
              </div>

              <div>
                {/* On mobile show shortTitle, on sm+ show full title */}
                <span className="block text-[11px] sm:text-xs font-bold text-[#0B0B0B] sm:hidden truncate">
                  {s.shortTitle}
                </span>
                <span className="hidden sm:block text-xs font-bold text-[#0B0B0B] truncate">
                  {s.title}
                </span>
                <span className="hidden sm:block text-[10px] text-[#6C6659] truncate font-sans">
                  {s.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
